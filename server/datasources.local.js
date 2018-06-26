module.exports = {
  "db": {
    "name": "db",
    "connector": "memory"
  },
  "mysql_ds": {
    "url": `mysql://${ process.env.DB_USER }:${ process.env.DB_PASSWORD }@${ process.env.DB_HOST }:${ process.env.DB_PORT }/${ process.env.DB_NAME }`,
    "name": "mysql_ds",
    "connector": "mysql"
  }
}
