FROM node:14-alpine as react-build

WORKDIR /app
COPY . ./
RUN yarn && rm -rf /root/.cache
COPY node_modules/@backstage ./node_modules/@backstage
CMD ["yarn", "workspace", "app", "start"]

# server environment
# FROM nginx:alpine
# COPY nginx.conf /etc/nginx/conf.d/configfile.template
# COPY --from=react-build /app/packages/app/dist /usr/share/nginx/html
# ENV PORT 8080
# EXPOSE 8080
# CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"