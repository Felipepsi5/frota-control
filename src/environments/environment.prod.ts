export const environment = {
  production: true,
  apiUrl: '/api', // Em produção, usar proxy do Nginx para API .NET Core
  firebase: {
    apiKey: "your-prod-api-key-here",
    authDomain: "your-prod-project.firebaseapp.com",
    projectId: "your-prod-project-id",
    storageBucket: "your-prod-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-prod-app-id"
  }
};
