import {
      SecretsManagerClient,
      GetSecretValueCommand,
  } from "@aws-sdk/client-secrets-manager";
  
  // Secrets Manager configuration
  const secret_name = "HitoEnvSecret";
  const secretsClient = new SecretsManagerClient({ region: "ap-northeast-1" });
  
 export const getSecrets = async () => {
      try {
          const response = await secretsClient.send(
              new GetSecretValueCommand({
                  SecretId: secret_name,
                  VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
              })
          ) as any;
          return JSON.parse(response.SecretString); // Parse the secret string into an object
      } catch (error) {
          console.error("Error fetching secrets:", error);
          throw error;
      }
  }
  
  export const getSecretOfKey = async (key:any) => {
      try {
          const secrets = await getSecrets();
          return secrets[key];
      } catch (error) {
          console.error("Error fetching secret of key:", error);
          throw error;
      }
  }
  