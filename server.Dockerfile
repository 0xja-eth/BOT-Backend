# 使用官方Node.js镜像作为基础镜像
FROM node:18.16-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 文件到工作目录
COPY package.json ./

# 安装项目依赖
RUN npm install --legacy-peer-deps

# 复制项目文件到工作目录
COPY src ./src
COPY contracts.json ./
COPY idls ./idls
COPY tsconfig.json ./
COPY webpack.config.js ./

# 构建 TypeScript 项目
RUN npm run build

# 暴露应用运行的端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "build/server.js"]
