import { ExtensionContext, SecretStorage } from "vscode";
import { UNABLE_TO_STORE_AUTH_ERR, OCTOPUS_DEPLOY_AUTH } from "./constants";

export type OctopusDeployApiData = {
    apiKey: string | undefined;
    apiUri: string | undefined;
    space: string | undefined;
};

export class OctopusDeploySettings {
    private static _instance: OctopusDeploySettings;
    private storage: SecretStorage;

    constructor(private context: ExtensionContext) {
        this.storage = context.secrets;
    }

    static init(context: ExtensionContext): void {
        OctopusDeploySettings._instance = new OctopusDeploySettings(context);
    }

    static get instance(): OctopusDeploySettings {
        return OctopusDeploySettings._instance;
    }

    async storeSettings(apiKey?: string, apiUri?: string, space?: string): Promise<void> {
        try {
            let settings = await this.getSettings();
            if (apiKey) {
                settings.apiKey = apiKey;
            }
            if (apiUri) {
                settings.apiUri = apiUri;
            }
            if (space) {
                settings.space = space;
            }
            this.storage.store(
                OCTOPUS_DEPLOY_AUTH,
                JSON.stringify(settings)
            );
        } catch (err) {
            console.log(UNABLE_TO_STORE_AUTH_ERR, err);
        }
    }

    async getSettings(): Promise<OctopusDeployApiData> {
        const authDataString = await this.storage.get(OCTOPUS_DEPLOY_AUTH);
        if (authDataString !== null && authDataString !== undefined) {
            return JSON.parse(authDataString) as OctopusDeployApiData;
        } else {
            return {
                apiKey: undefined,
                apiUri: undefined,
                space: undefined,
            };
        }
    }
}
