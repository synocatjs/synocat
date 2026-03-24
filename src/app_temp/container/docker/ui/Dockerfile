# 使用官方 Nginx 镜像
FROM nginx:alpine

# 设置维护者信息
LABEL maintainer="Your Name <your.email@example.com>"
LABEL description="Simple web app showing installation success"

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 删除默认的 Nginx 页面
RUN rm -rf ./*

# 复制网页文件到容器
COPY index.html .
COPY css ./css

# 复制自定义 Nginx 配置
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ =404; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 16080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]