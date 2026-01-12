# 使用 Node.js 20 官方版本
FROM node:20-slim

# 設定工作目錄
WORKDIR /usr/src/app

# 先複製 package.json 以利快取 layer
COPY package*.json ./
RUN npm install

# 複製其餘程式碼
COPY . .

# 暴露你的 Line Bot 監聽 Port (假設是 3000)
EXPOSE 3000

# 啟動指令
CMD [ "node", "index.js" ]
