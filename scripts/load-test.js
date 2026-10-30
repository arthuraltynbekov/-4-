
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '3m', target: 10 },
        { duration: '30s', target: 0 },
    ],

    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99'],
    },
};

export default function () {

    // Сценарий 1. Получение списка публикаций
    const getResponse = http.get(`${BASE_URL}/posts`);

    check(getResponse, {
        'GET: статус 200': (r) => r.status === 200,

        'GET: ответ содержит JSON': (r) =>
            r.headers['Content-Type'] &&
            r.headers['Content-Type'].includes('application/json'),

        'GET: получено 100 публикаций': (r) => {
            try {
                return Array.isArray(r.json()) &&
                    r.json().length === 100;
            } catch (error) {
                return false;
            }
        },
    });

    sleep(1);

    // Сценарий 2. Создание публикации
    const postData = {
        title: 'Load Test Publication',
        body: 'Test publication created during load testing',
        userId: 1,
    };

    const postResponse = http.post(
        `${BASE_URL}/posts`,
        JSON.stringify(postData),
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );

    check(postResponse, {
        'POST: статус 201': (r) => r.status === 201,

        'POST: ответ содержит JSON': (r) =>
            r.headers['Content-Type'] &&
            r.headers['Content-Type'].includes('application/json'),

        'POST: возвращены корректные данные': (r) => {
            try {
                const data = r.json();

                return data.title === postData.title &&
                    data.body === postData.body &&
                    data.userId === postData.userId;
            } catch (error) {
                return false;
            }
        },
    });

    sleep(1);
}
