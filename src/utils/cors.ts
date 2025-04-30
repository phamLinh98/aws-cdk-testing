export const addCorsHeaders = (res: any) => {
      return {
            ...res,
            headers: {
                  ...res.headers,
                  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:5173',
                  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
                  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
                  'Access-Control-Allow-Credentials': 'true',
            },
      }
}