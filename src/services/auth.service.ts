// import speakeasy from 'speakeasy';
// import { GeneratedSecret } from 'speakeasy';
import qs from 'qs';
import axios from 'axios';
import KcAdminClient from 'keycloak-admin';
import { HttpException } from '../exceptions/HttpException';
import { isEmpty } from '../utils/type&emptyValidte';
import { KeycloakTokenResponse, UserSignupData, UserLoginData, KeycloakUser } from '../interfaces/auth.interface';


class AuthService {
    private kcAdminClient: KcAdminClient;
    private readonly keycloakRealm: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly adminUser: string;
    private readonly adminPass: string;
    private readonly keycloakURL: string;

    constructor() {
        this.keycloakRealm = process.env.KEYCLOAK_REALM!;
        this.clientId = process.env.KEYCLOAK_CLIENT_ID!;
        this.clientSecret = process.env.KEYCLOAK_CLIENT_SECRET!;
        this.adminUser = process.env.KEYCLOAK_ADMIN!;
        this.adminPass = process.env.KEYCLOAK_ADMIN_PASSWORD!;
        this.keycloakURL = process.env.KEYCLOAK_URL!;

        this.kcAdminClient = new KcAdminClient({
            baseUrl: this.keycloakURL,
            realmName: 'master',
        });
    }

    private async getAdminToken(): Promise<string> {
        try {
            await this.kcAdminClient.auth({
                username: this.adminUser,
                password: this.adminPass,
                grantType: 'password',
                clientId: 'admin-cli',
            });
            return this.kcAdminClient.accessToken;
        } catch (error: any) {
            throw new HttpException(400, error?.response?.data?.errorMessage || 'Failed to get admin token');
        }
    }

    private async createUserWithAdminToken(token: string, userData: UserSignupData): Promise<string> {
        try {
            const createResponse = await axios.post(
                `${this.keycloakURL}/admin/realms/${this.keycloakRealm}/users`,
                {
                    username: userData.username,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    enabled: true,
                    emailVerified: true,
                    credentials: [{
                        type: 'password',
                        value: userData.password,
                        temporary: false
                    }]
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const locationHeader = createResponse.headers['location'] || createResponse.headers['Location'];
            if (!locationHeader) throw new Error('User created but no location header returned.');

            const userId = locationHeader.split('/').pop();

            const userResponse = await axios.get<KeycloakUser>(
                `${this.keycloakURL}/admin/realms/${this.keycloakRealm}/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return userResponse.data.id;
        } catch (error: any) {
            throw new HttpException(400, error?.response?.data?.errorMessage || 'User creation failed');
        }
    }

    public async signup(userData: UserSignupData): Promise<string> {
        if (isEmpty(userData)) throw new HttpException(400, 'Signup data is empty');
        const token = await this.getAdminToken();
        const keycloakUser = await this.createUserWithAdminToken(token, userData);
        return keycloakUser;
    }

    public async login(userData: UserLoginData): Promise<any> {
        if (isEmpty(userData)) throw new HttpException(400, 'Login data is empty');
        try {
            const payload = qs.stringify({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'password',
                scope: 'openid',
                username: userData.username,
                password: userData.password,
            });

            const tokenResponse = await axios.post<KeycloakTokenResponse>(
                `${this.keycloakURL}/realms/${this.keycloakRealm}/protocol/openid-connect/token`,
                payload,
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }
            );

            const tokenData = tokenResponse.data;
            if (!tokenData?.access_token) {
                throw new HttpException(401, 'Keycloak authentication failed');
            }

            const userInfoResponse = await axios.get(
                `${this.keycloakURL}/realms/${this.keycloakRealm}/protocol/openid-connect/userinfo`,
                {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                    },
                }
            );

            if (!userInfoResponse.data) {
                throw new HttpException(401, 'Failed to fetch user info from Keycloak');
            }

            return {
                tokenData,
                userInfo: userInfoResponse.data,
            };
        } catch (error: any) {
            throw new HttpException(
                error?.response?.status || 500,
                error?.response?.data?.error_description || error?.message || 'Login failed'
            );
        }
    }
}

export default AuthService;

