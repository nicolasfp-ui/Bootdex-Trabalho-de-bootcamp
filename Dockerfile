FROM nginx:stable-alpine

# Lista explícita: testes, documentação e credenciais não fazem parte do site.
COPY index.html style.css script.js config.js favoritos-api.js favoritos-ui.js time-ui.js /usr/share/nginx/html/

EXPOSE 80
