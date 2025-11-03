const axios = require('axios');
const base64 = require('base-64');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const server = 'http://localhost:3000';
chai.use(chaiHttp);

let newProductId = '';
const user = {
    name: 'Chibuzor',
    surname: 'Obi',
    email: 'jonathanobi47@gmail.com',
    password: '12345678' 
};

const authHeader = { Authorization: `Basic ${base64.encode(`${user.email}:${user.password}`)}` };

const adminAuthHeader = `Basic ${Buffer.from('admin@cc.com:adminpass').toString('base64')}`;

describe('CC Goodies API Tests', () => {

//USERS (POST & GET)

    describe('USER & AUTH API', () => {
        // it('POST /users/signup should successfully register a new user (201)', (done) => {
        //     chai.request(server)
        //         .post('/users/signup')
        //         .send(user)
        //         .end((err, res) => {
        //             expect(res).to.have.status(201, 'Response status should be 201');
        //             expect(res.body).to.have.property('token', 'Response should contain a JWT token');
        //             done();
        //         });
        // });

        // it('POST /users/login should successfully log in the signed up user (200)', (done) => {
        //     chai.request(server)
        //         .post('/users/login')
        //         .send({ email: user.email, password: user.password }) 
        //         .end((err, res) => {
        //             expect(res).to.have.status(200, 'Response status should be 200');
        //             expect(res.body).to.have.property('token', 'Response should contain a JWT token');
        //             done();
        //         });
        // });

        it('POST /users/login should return 401 for bad password', (done) => {
            chai.request(server)
                .post('/users/login')
                .send({ email: user.email, password: "COPASSWORD" }) 
                .end((err, res) => {
                    expect(res).to.have.status(401, 'Response status should be 401');
                    done();
                });
        });

        it('GET /users (Protected Route) should fail without authorization header (401)', (done) => {
            chai.request(server)
                .get('/users')
                .end((err, res) => {
                    expect(res).to.have.status(401, 'Response status should be 401');
                    expect(res.body.message).to.include('Authorization header missing', 'Error message should indicate missing auth');
                    done();
                });
        });

        // it('GET /users (Protected Route) should succeed with Basic Auth (200)', (done) => {
        //     chai.request(server)
        //         .get('/users')
        //         .set('Authorization', adminAuthHeader)
        //         .end((err, res) => {
        //             expect(res).to.have.status(200, 'Response status should be 200');
        //             expect(res.body).to.be.an('array', 'Response body should be an array of users');
        //             done();
        //         });
        // });
    });

//PRODUCTS (POST & GET)

    describe('PRODUCTS API (/products)', () => {

        // it('POST /products should successfully add a new product (201)', (done) => {
        //     const productData = {
        //         productName: 'Instant Coffee 200g',
        //         description: 'Premium instant coffee for a rich and aromatic experience.',
        //         price: 75.00,
        //         stock: 110,
        //         category: 'Beverages'
        //     };
        //     chai.request(server)
        //         .post('/products')
        //         .send(productData)
        //         .end((err, res) => {
        //             expect(res).to.have.status(201, 'Response status should be 201');
        //             expect(res.body).to.have.property('insertedId', 'Response should contain insertedId');
        //             newProductId = res.body.insertedId;
        //             done();
        //         });
        // });

        it('GET /products should return a list of products (200)', (done) => {
            chai.request(server)
                .get('/products')
                .end((err, res) => {
                    expect(res).to.have.status(200, 'Response status should be 200');
                    expect(res.body).to.be.an('array', 'Response body should be an array');
                    expect(res.body.length).to.be.at.least(1, 'Array should contain at least one product');
                    done();
                });
        });

        // it('GET /products/:id should return the specific product (200)', (done) => {
        //     chai.request(server)
        //         .get(`/products/${newProductId}`)
        //         .end((err, res) => {
        //             expect(res).to.have.status(200, 'Response status should be 200');
        //             expect(res.body).to.be.an('object', 'Response body should be an object');
        //             expect(res.body.productName).to.equal('Instant Coffee 200g', 'Product name should match');
        //             done();
        //         });
        // });

        it('GET /products/:id with invalid ID should return 404 Not Found', (done) => {
            chai.request(server)
                .get('/products/5f9d1b9b9d3b1e0017a5b3f1')
                .end((err, res) => {
                    expect(res).to.have.status(404, 'Response status should be 404');
                    done();
                });
        });
    });


    // BANKING & ORDER ENDPOINTS (POST & GET)

    describe('Banking & Order APIs', () => {

        it('POST /api/userBankingDetails should save new banking details (201)', (done) => {
            const bankingData = { userId: '1JB001', cardNumber: '', accountNumber: '6302941782', bankName: 'Standard Bank' };
            chai.request(server)
                .post('/api/userBankingDetails')
                .send(bankingData)
                .end((err, res) => {
                    expect(res).to.have.status(201, 'Response status should be 201');
                    done();
                });
        });

        it('POST /api/orders should save a new order (201)', (done) => {
            const orderData = { email: 'jeffreyshotsha20@gmail.com', items: [{ name: 'Instant Coffee 200gug', price: 75.00 }], total: 75.00 };
            chai.request(server)
                .post('/api/orders')
                .send(orderData)
                .end((err, res) => {
                    expect(res).to.have.status(201, 'Response status should be 201');
                    done();
                });
        });

        it('GET /api/orders/:email should return orders for a specific email (200)', (done) => {
            chai.request(server)
                .get('/api/orders/jeffreyshotsha20@gmail.com')
                .end((err, res) => {
                    expect(res).to.have.status(200, 'Response status should be 200');
                    expect(res.body).to.be.an('array', 'Response body should be an array');
                    expect(res.body.length).to.be.at.least(1, 'Should return at least one order');
                    done();
                });
        });
    });


    after(async () => {

    });
});
