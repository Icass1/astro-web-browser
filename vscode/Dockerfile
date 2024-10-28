FROM debian

RUN apt update
RUN apt install curl -y

COPY install.sh install.sh

# RUN curl -fsSL https://code-server.dev/install.sh | sh


RUN sh install.sh

ENTRYPOINT [ "code-server", "--bind-addr", "0.0.0.0:8081", "--auth", "none", "--app-name", "APP Name", "--welcome-text", "Welcome Text", "--abs-proxy-base-path", "vscode" ]