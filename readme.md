## Chatanoo Mobile

### Install

Use `npm` to install dependencies

```
npm install
```

Create your `.env` file

```
cp .env.sample .env
```

### Run locally

```
node index.js
```

And open `http://localhost:4000` on your browser

### Deployment

#### Initialize

Chatanoo is hosted on Elastic Beanstalk, you need to use `eb` command line tool to deploy the project (http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)

```
eb init
```

Choose `chatanoo-mobile` application and `chatanoo-mobile-staging` as environment.

#### Staging

```
eb deploy
```

#### Production

```
eb deploy chatanoo-mobile
```