const axios = require('axios').default;
const catApi = 'https://cloudcatsapi-k3dzw45ylq-uc.a.run.app';


$(document).ready(function () {
    let htmlString = '';
    for (let i = 0; i < 10; i++) {
        axios.get(`${catApi}/cat`).then((resp) => {
            htmlString += `<a href="${resp.data}" data-lightbox="cat-img"><img src=${resp.data}</a>`;
            $('.gallery').html(htmlString);
        })
    }
});

