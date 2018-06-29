# Seed Generator based on Faker.js

This little tool is meant to be used as a generator for fake data based on the models from a Loopback 3.x project. It generates the fake records using the library faker.js and its mustache feature. See [mustache syntax](https://github.com/marak/Faker.js/#fakerfake)
___
### Common usage

```sh
1.- $ npm run prepare:seeds
      //This will create the missing seedModels on directory './seeds/seedModels/'
      
2.- $ Fill the generate JSON of the model from which you want to generate fake records on the database. It must be populated with the Faker.js mustache syntax.

3.- $ npm run execute:seeds <Model> <Records>    
      //This will generate fake data on the database based on the given model and the given number of records.
```

###### NOTE: The unique Loopback validation may cause errors sometimes by running the "execute:seeds" command, because of rarely, Faker repeats some strings on its fake data.
###### NOTE 1: It is not recommended to use a huge number of records by running the "execute:seeds" command, because it may block or break your application.
___

### Commands to use this tool.

| Command | Params | Description |  Example |
| ------ | ------ | ------ |  ------ |
| npm run prepare:seeds | None | Generates seedModels folder and seedModels JSON files if they not exist already. If they already exist, It will just generate the remaining ones. The existing ones will remain intact. It uses the JSON files from Loopback Models to generate its own seed files in order to generate the fake data. It requires to have the 'properties_seeds' Model's property filled with the proper Faker mustache syntax | npm run prepare:seeds
| npm run execute:seeds | "Loopback Model and "The desired number of records" | Generates fake models on a database based on the given Model and a given number of records. | npm run execute:seeds Provider 10

### A well populated  JSON seedModel with mustache syntax

```sh
{
  "filename": "provider.json",
  "name": "Provider",
  "properties_seeds": [
    {
      "name": "{{name.findName}}"
    },
    {
      "phone": "{{phone.phoneNumber}}"
    },
    {
      "address": "{{address.streetAddress}} {{address.city}} {{address.country}}"
    },
    {
      "email": "{{internet.email}}"
    }
  ]
}

```

###### NOTE: You can check the Faker.js documentation for the mustache syntax on this [link](https://github.com/marak/Faker.js/#fakerfake)
