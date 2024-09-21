const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const PORT_NU = 3000
const dbFilePath = path.join(__dirname,'todoApplication.db');
const app = express()
let db = null

app.use(express.json())

const intialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbFilePath,
      driver: sqlite3.Database,
    });

    let query=`
    create table if not exists todo(
      id integer,
      todo text,
      priority text,
      status text
    );`;
    await db.run(query);

    app.listen(PORT_NU, () =>
      console.log(
        'Table todo is created successfully!\nServer is running at https://nitishbfiesnjscprhnky.drops.nxtwave.tech',
      )
    );
  } catch (e) {
    console.log("Db Error:", e.message);
  }
};

intialiseDbAndServer();

app.get('/todos', async (req, res) => {
  const {status="", priority="", search_q=""} = req.query;
  let query=`
    select * from todo
    where todo like "%${search_q}%"
    and status like "%${status}%"
    and priority like "%${priority}%"
    ;
  `;
  let todos=await db.all(query);
  res.send(todos);
});

app.get('/todos/:todoId', async (req, res) => {
  const {todoId} = req.params;
  let query = `
    select * from todo where id=${todoId};`

  let todo = await db.get(query)

  res.send(todo)
});

app.post('/todos', async (req, res) => {
  const {id, todo, priority, status} = req.body
  let query = `
    insert into todo values(${id}, "${todo}", "${priority}", "${status}");`

  await db.run(query)
  res.send('Todo Successfully Added')
})

app.put('/todos/:todoId', async (req, res) => {
  const {todoId} = req.params
  const {status = null, priority = null, todo = null} = req.body
  console.log(status, priority, todo);
  let query = `
    update todo
    set
    ${todo != null ? `todo="${todo}"` : ''}
    ${priority != null ? `priority="${priority}"`: ''}
    ${status != null ? `status="${status}"` : ''}
    where id=${todoId};
    `;
  await db.run(query)

  let responseMsg = `${
    status != null ? 'Status' : todo != null ? 'Todo' : 'Priority'
  } Updated`
  res.send(responseMsg)
})

app.delete('/todos/:todoId', async (req, res) => {
  const {todoId} = req.params
  let query = `
    delete from todo where id=${todoId};`
  await db.run(query);
  res.send("Todo Deleted");
})

module.exports=app;