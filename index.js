const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");

const server_instance = express();
const dbPath = path.join(__dirname, "city.db");
let dataBase = null;

server_instance.use(cors());
server_instance.use(express.json());

const initialize_DataBase_and_Server = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    server_instance.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

initialize_DataBase_and_Server();

// Method: POST (Create City API)
server_instance.post("/create_city", async (request, response) => {
  const {
    cityName,
    stateName,
    countryName,
    population,
    latitude,
    longitude,
  } = request.body;

  try {
    const checkExistCityQuery = `SELECT * FROM city WHERE city_name = ?;`;
    const checkExistCity = await dataBase.get(checkExistCityQuery, [cityName]);
    if (checkExistCity === undefined) {
      const createCityQuery = `INSERT INTO city (city_name, state_name, country_name, population, latitude, longitude) VALUES (?,?,?,?,?,?);`;
      await dataBase.run(createCityQuery, [
        cityName,
        stateName,
        countryName,
        population,
        latitude,
        longitude,
      ]);
      console.log("City created:", cityName);
      response.status(201).send(`${cityName} city created successfully`);
    } else {
      response.status(409).send(`City "${cityName}" already exists.`);
    }
  } catch (error) {
    console.log(`Error while creating city: ${error}`);
    response.status(500).send(`Server Error ${error.message}`);
  }
});

// Method:PUT (Update City API)
server_instance.put("/update_city/:oldCityName/", async (request, response) => {
  const { oldCityName } = request.params;
  try {
    const checkExistCityQuery = `SELECT * FROM city WHERE city_name=?;`;
    const checkExistCity = await dataBase.get(checkExistCityQuery, [
      oldCityName,
    ]);
    if (checkExistCity === undefined) {
      response
        .status(404)
        .send(`${oldCityName} city resource is not found in server`);
    } else {
      const {
        cityName = checkExistCity.city_name,
        stateName = checkExistCity.state_name,
        countryName = checkExistCity.country_name,
        population = checkExistCity.population,
        latitude = checkExistCity.latitude,
        longitude = checkExistCity.longitude,
      } = request.body;
      const updateExistCityQuery = `UPDATE city SET city_name = ?, state_name = ?, country_name = ?, population = ?, latitude = ?, longitude = ? WHERE city_name = ?;`;
      const updateExistCity = await dataBase.run(updateExistCityQuery, [
        cityName,
        stateName,
        countryName,
        population,
        latitude,
        longitude,
        oldCityName,
      ]);
      if (updateExistCity.changes === 0) {
        response
          .status(400)
          .send(`No changes were made to city '${oldCityName}'.`);
      } else {
        const updatedCityQuery = `SELECT * FROM city WHERE city_name=?;`;
        const updatedCity = await dataBase.get(updatedCityQuery, [cityName]);
        response.status(200).send({
          message: `City '${oldCityName}' has been successfully updated.`,
          city: updatedCity,
        });
      }
    }
  } catch (error) {
    console.log(`Error while update city related data: ${error}`);
    response.status(500).send(`Server Error ${error.message}`);
  }
});

// Method:Delete (Delete City API)
server_instance.delete(
  "/delete_city/:oldCityName/",
  async (request, response) => {
    const { oldCityName } = request.params;

    try {
      const existCityCheckQuery = `SELECT * FROM city WHERE city_name=?;`;
      const existCityCheck = await dataBase.get(existCityCheckQuery, [
        oldCityName,
      ]);
      if (existCityCheck === undefined) {
        response
          .status(404)
          .send(`${oldCityName} city resource is not found in server`);
      } else {
        const deleteCityQuery = `DELETE FROM city WHERE city_name = ?;`;
        await dataBase.run(deleteCityQuery, [existCityCheck.city_name]);
        response.status(200).send(`City "${oldCityName}' deleted successfully`);
      }
    } catch (error) {
      console.log(`Error while delete city related data: ${error}`);
      response.status(500).send(`Server Error ${error.message}`);
    }
  }
);

// Method: GET (Get City API)
// Design an API to retrieve cities from the collection.
// Support pagination, filtering, sorting, searching, and projection.
// Support the following query parameters:
// 1. page: Page number for pagination
// 2. limit: Maximum number of cities per page
// 3. filter: Filter cities based on specified criteria
// 4. sort: Sort cities based on a specified field and order
// 5. search: Search for cities based on a search term.
// 6. projection: Specify which fields to include or exclude from the response
// sqlite> PRAGMA table_info(city);
// 0|id|INTEGER|1||1
// 1|city_name|TEXT|0||0
// 2|state_name|TEXT|0||0
// 3|country_name|TEXT|0||0
// 4|population|INTEGER|0||0
// 5|latitude|REAL|0||0
// 6|longitude|REAL|0||0
// sqlite>

server_instance.get("/city", async (request, response) => {
  const { page, filter, sort, search, projection } = request.query;
  const offset = parseInt(page) > 0 ? page * 5 : 0;
  const limit = 5;
  let query;
  if (!projection) {
    if (search) {
    }
  } else {
  }
});
