const fetch = require('node-fetch');

// bytt denne med en selvgenrert token
const APItoken = '10900~ga5NWhKSVCm6Cse2EZA1eDEkYWPJiDlavkfntEVLbilfr6YQ0YbyRv1NBmxJ'; // fake-token

// url til første kall. bytt med aktuell institusjon - konto id kan man bytte om man ønsker dette for underkonto
const initURL = 'https://INSTITUSJON.instructure.com/api/v1/accounts/1/courses?page=1&per_page=100';

// lat global array for oppsamling av course-objekt
let courses = [];

// rekursiv håndtering av paginering
async function getCourses(url) {
    try {
        let response = await fetch(url, {
            headers: {
                authorization: 'Bearer ' + APItoken
            }
        });

        // stygg vasking av link header
        let link = response.headers.get('link');
        let links = link.split(',');
        let currentURL = links[0].split(';')[0].replace('<', '').replace('>', '');
        let nextURL = links[1].split(';')[0].replace('<', '').replace('>', '');
        let lastURL = null;
        // tar høyde for om current === last
        if (typeof links[4] !== 'undefined')
            lastURL = links[4].split(';')[0].replace('<', '').replace('>', '');
        else
            lastURL = links[3].split(';')[0].replace('<', '').replace('>', '');
        let responseData = await response.json();
        if (currentURL === lastURL) {
            courses.push.apply(courses, responseData);
            return courses;
        } else {
            courses.push.apply(courses, responseData);
            await getCourses(nextURL);
        }
        return courses;
    } catch (error) {
        console.log('Error fetching and parsing data', error);
    }
}

async function execute() {
     return await getCourses(initURL);
}

execute()
.then((courses) => {
    let totalCourseCnt = courses.length;
    let moduleCourseCnt = 0;
    let wikiCourseCnt = 0;
    let syllabusCourseCnt = 0;
    let assignmentCourseCnt = 0;
    let feedCourseCnt = 0;
    for(course in courses) {
        switch(courses[course].default_view) {
            case 'feed':
                feedCourseCnt++;
                break;
            case 'wiki':
                wikiCourseCnt++;
                break;
            case 'assignment':
                assignmentCourseCnt++;
                break;
            case 'modules':
                moduleCourseCnt++;
                break;
            case 'syllabus':
                syllabusCourseCnt++;
        }
    }

    console.log('Antall emner: ' + totalCourseCnt);
    console.log('Antall emner med emnemoduler: ' + moduleCourseCnt);
    console.log('Antall emner med forside: ' + wikiCourseCnt);
    console.log('Antall emner med emneoversikt: ' + syllabusCourseCnt);
    console.log('Antall emner med oppgaveliste: ' + assignmentCourseCnt);
    console.log('Antall emner med aktivitetsstrøm: ' + feedCourseCnt);
});