import pet from '../fixtures/pet.json'
import { faker } from '@faker-js/faker';

pet.id = faker.number.int({ min: 10000000000000, max: 1000000000000000})
pet.name = faker.animal.dog();

describe('PetStore test suit', () => {
    let petId;
    let date;

    it('Create pet', () => {
        cy.request('POST', '/pet', pet).then(response => {
            expect(response.status).to.be.equal(200);
            expect(response.body.name).to.be.equal(pet.name);

            // example for extracting values from body and headers
            petId = response.body.id;
            date = response.headers.date;

            cy.log(pet.id);
            cy.log(petId);

            cy.request(`/pet/${petId}`).then(response => {
                expect(response.status).to.be.equal(200);
                expect(response.body.name).to.be.equal(pet.name);
            })
        })
    })

    it('Get pet by id', () => {
        cy.request(`/pet/${petId}`).then(response => {
            expect(response.status).to.be.equal(200);
            expect(response.body.name).to.be.equal(pet.name);
        })
    })

    it('Update pet', () => {
        pet.status = 'pending';
        pet.tags[0].name = faker.hacker.verb();
        pet.tags[0].id = faker.number.int({ min: 100000, max: 1000000});

        cy.request({
            method: 'PUT',
            url: '/pet',
            body: pet,
        }).then(response => {
            expect(response.status).to.be.equal(200);
            expect(response.body.name).to.be.equal(pet.name);
            expect(response.body.status).to.be.equal(pet.status);
            expect(response.body.tags[0].id).to.be.equal(pet.tags[0].id);
            expect(response.body.tags[0].name).to.be.equal(pet.tags[0].name);

            cy.request(`/pet/${petId}`).then(response => {
                expect(response.status).to.be.equal(200);
                expect(response.body.name).to.be.equal(pet.name);
                expect(response.body.status).to.be.equal(pet.status);
                expect(response.body.tags[0].id).to.be.equal(pet.tags[0].id);
                expect(response.body.tags[0].name).to.be.equal(pet.tags[0].name);
            })
        })
    })

    it('Update pet with form data', () => {
        pet.name = faker.hacker.verb();

        cy.request({
            method: 'POST',
            url: `/pet/${petId}`,
            form: true,
            body: pet
        }).then(response => {
            expect(response.status).to.be.equal(200);
            expect(response.body.code).to.be.equal(200);
            expect(response.body.message).to.be.equal(`${pet.id}`);
            expect(response.body.type).to.be.equal('unknown');

            cy.request(`/pet/${petId}`).then(response => {
                expect(response.status).to.be.equal(200);
                expect(response.body.name).to.be.equal(pet.name);
                expect(response.body.status).to.be.equal(pet.status);
                expect(response.body.tags[0].id).to.be.equal(pet.tags[0].id);
                expect(response.body.tags[0].name).to.be.equal(pet.tags[0].name);
            })
        })
    })

    it('Finds Pets by status', () => {

        cy.request({
            method: 'GET',
            url: "pet/findByStatus?status=pending",
            form: true,
            body: pet

        }).then(response => {
            expect(response.status).to.be.equal(200);
            expect(response.body).to.be.an('array');
            response.body.forEach(pet => {
              expect(pet.status).to.be.equal("pending");
            });
        })
    })

    it('Deletes pet', () => {

           cy.log('Find pet by id');
           cy.request(`/pet/${petId}`).then(response => {
               expect(response.status).to.be.equal(200);
               expect(response.body.name).to.be.equal(pet.name);
           })

           cy.log('Delete found pet');
           cy.request('DELETE', `/pet/${petId}`).then(deleteResponse => {
               expect(deleteResponse.status).to.equal(200);
           })

           cy.log('Check that pet is removed');
           cy.request(`/pet/${petId}`).then(verifyResponse => {
             expect(verifyResponse.status).to.equal(404);
             expect(verifyResponse.body.message).to.contain('Pet not found');
           })
    })
})
