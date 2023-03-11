
import assert from 'assert';

import { runSQL, buildDbEnv, } from '../index.js';
import axios from 'axios';

// https://jsonplaceholder.typicode.com/
async function getPhotos() {
    return (await axios.get('https://jsonplaceholder.typicode.com/photos')).data
}
async function getUsers() {

    return (await axios.get('https://jsonplaceholder.typicode.com/users')).data;
}
async function getTodos() {

    return (await axios.get('https://jsonplaceholder.typicode.com/todos')).data;
}
async function getAlbum() {

    return (await axios.get('https://jsonplaceholder.typicode.com/albums')).data;
}

export default async () => {
    const debug = true;
    const tables = [
        { identifier: 'todos', table: await getTodos() },

        { identifier: 'users', table: await getUsers() },
        { identifier: 'photos', table: await getPhotos() },
        { identifier: 'album', table: await getAlbum() },
    ]
    const env = buildDbEnv(tables, []);

    // list the users, todos with theirs status and posted photos.
    let result = runSQL(`
    Select id user_id,username,email,todo.title todo, todo.completed completed,album.thumbnailUrl thumbnailUrl
    from users as u
    LEFT JOIN todos as todo on todo.userId = users.id
    LEFT JOIN (Select photos.thumbnailUrl ,userId
               from album 
               inner join photos on photos.albumId = album.id ) as album on album.userId=todo.id
 `, env, debug);
    console.table(result)
    assert.deepStrictEqual(result, [{
        user_id: 1,
        username: 'Bret',
        email: 'Sincere@april.biz',
        todo: 'ullam nobis libero sapiente ad optio sint',
        completed: true,
        thumbnailUrl: 'https://via.placeholder.com/150/324309'
    },
    {
        user_id: 2,
        username: 'Antonette',
        email: 'Shanna@melissa.tv',
        todo: 'totam atque quo nesciunt',
        completed: true,
        thumbnailUrl: 'https://via.placeholder.com/150/fab5da'
    },
    {
        user_id: 3,
        username: 'Samantha',
        email: 'Nathan@yesenia.net',
        todo: 'et sequi qui architecto ut adipisci',
        completed: true,
        thumbnailUrl: 'https://via.placeholder.com/150/bbf2ae'
    },
    {
        user_id: 4,
        username: 'Karianne',
        email: 'Julianne.OConner@kory.org',
        todo: 'tempore molestias dolores rerum sequi voluptates ipsum consequatur',
        completed: true,
        thumbnailUrl: 'https://via.placeholder.com/150/1ce103'
    },
    {
        user_id: 5,
        username: 'Kamren',
        email: 'Lucio_Hettinger@annie.ca',
        todo: 'excepturi a et neque qui expedita vel voluptate',
        completed: false,
        thumbnailUrl: 'https://via.placeholder.com/150/b5f414'
    },
    {
        user_id: 6,
        username: 'Leopoldo_Corkery',
        email: 'Karley_Dach@jasper.info',
        todo: 'dolorem laboriosam vel voluptas et aliquam quasi',
        completed: false,
        thumbnailUrl: 'https://via.placeholder.com/150/85939d'
    },
    {
        user_id: 7,
        username: 'Elwyn.Skiles',
        email: 'Telly.Hoeger@billy.biz',
        todo: 'aut consectetur in blanditiis deserunt quia sed laboriosam',
        completed: true,
        thumbnailUrl: 'https://via.placeholder.com/150/1fb0be'
    },
    {
        user_id: 8,
        username: 'Maxime_Nienow',
        email: 'Sherwood@rosamond.me',
        todo: 'et praesentium aliquam est',
        completed: false,
        thumbnailUrl: 'https://via.placeholder.com/150/8cf664'
    },
    {
        user_id: 9,
        username: 'Delphine',
        email: 'Chaim_McDermott@dana.io',
        todo: 'debitis nisi et dolorem repellat et',
        completed: true,
        thumbnailUrl: 'https://via.placeholder.com/150/5dabd6'
    },
    {
        user_id: 10,
        username: 'Moriah.Stanton',
        email: 'Rey.Padberg@karina.biz',
        todo: 'ipsam aperiam voluptates qui',
        completed: false,
        thumbnailUrl: 'https://via.placeholder.com/150/6dd9cb'
    }])

}


