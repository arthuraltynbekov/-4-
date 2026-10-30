
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const options = {
    stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 30 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
    ],

    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99'],
    },
};

export default function () {
    const response = http.get(`${BASE_URL}/posts`);

    check(response, {
        'Статус ответа 200': (r) => r.status === 200,
        'Ответ содержит JSON': (r) =>
            r.headers['Content-Type'] &&
            r.headers['Content-Type'].includes('application/json'),
        'Получено 100 публикаций': (r) => {
            try {
                return Array.isArray(r.json()) &&
                    r.json().length === 100;
            } catch (error) {
                return false;
            }
        },
    });

    sleep(1);
}
