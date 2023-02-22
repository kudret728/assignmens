describe('Back End Test', () => {

    const shoppingCartEndPoint = 'https://everlywell.com/v9/shoppingCart'
    const userSurveyEndPoint = 'https://everlywell.com/v9/userSurvey'
    const promoCodeEndPoint = 'https://everlywell.com/v9/promoCode'
    const requestHeaders = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer eyJ0eXAAAAA1234567800'
    }
    
    it('Scenario 1', () => {
        cy.request({
            method: 'GET',
            url: shoppingCartEndPoint,
            headers: requestHeaders,
        }).then((response) => {
            // validate the response status code
            expect(response.status).to.eq(200) 
            // retrieve subTotal field from the response                 
            const returnedSubTotal = response.body['subTotal']   
            // retrieve all items from the response
            const returnedItems = response.body['items']         
            let subTotal = 0 
            // loop through each item in items field                                   
            for (let itemData in returnedItems) {  
            // add value in price field to the new subTotal variable             
                subTotal += itemData['price']                   
            }
            // validate the 2 totals are the same 
            expect(returnedSubTotal).to.eq(subTotal)            
        })
    });

    //usually the submitting survey return 201 instead of 200, but i will add 200 same as 201
    it('Scenario 2 - 200 ', () => {
        cy.request({
            method: 'POST',
            url: userSurveyEndPoint,
            headers: requestHeaders,
            body: {
                "userId": 12345,
                "sessionId": "7x78634",
                "userText": "I love this product",
                "userScore": 100
            }
        }).then((response) => {
            expect(response.status).to.eq(201)
        })
    });
    it('Scenario 2 - 201 ', () => {
        cy.request({
            method: 'POST',
            url: userSurveyEndPoint,
            headers: requestHeaders,
            body: {
                "userId": 12345,
                "sessionId": "7x78634",
                "userText": "I love this product",
                "userScore": 100
            }
        }).then((response) => {
            expect(response.status).to.eq(201)
        })
    });

    it('Scenario 2 - 400', () => {
        cy.request({
            method: 'POST',
            url: userSurveyEndPoint,
            headers: requestHeaders,
            body: {
                "userId": 12345,
                "sessionId": "7x78634",
                "userText": "I love this product",
                // assume null for "userScore" is not acceptable
                "userScore": null                               
            }
        }).then((response) => {
            expect(response.status).to.eq(400)
        })
    });

    it('Scenario 2 - 404', () => {
        cy.request({
            method: 'POST',
            url: userSurveyEndPoint,
            headers: requestHeaders,
            body: {
                // assume "userId" cannot be found
                "userId": 00000,                                
                "sessionId": "7x78634",                         
                "userText": "I love this product",
                "userScore": 100                               
            }
        }).then((response) => {
            expect(response.status).to.eq(404)
        })
    });

    it('Scenario 3', () => {
        // request to get total before appplying promocode
        cy.request({                                                
            method: 'GET',
            url: shoppingCartEndPoint,
            headers: requestHeaders,
        }).then((shoppingCartResp) => {
            // should return 200
            expect(shoppingCartResp.status).to.eq(200)          
            // get totalBeforePromoCode
            const totalBeforePromoCode = shoppingCartResp.body['subTotal']  
         // request to apply promocode with 100% discount
            cy.request({                                            
                method: 'POST',
                url: promoCodeEndPoint,
                headers: requestHeaders,
                body: {
                    // 100% discount, which should trigger 400 response
                    'promoCodeRate': 100                            
                },
            }).then((promoCodeResp) => {
                // should return 400
                expect(promoCodeResp.status).to.eq(400)             
                // request to get total after promocode applied
                cy.request({                                        
                    method: 'GET',
                    url: shoppingCartEndPoint,
                    headers: requestHeaders,
                }).then((shoppingCartRespAfterPromo) => {
                    // should return 200
                    expect(shoppingCartRespAfterPromo.status).to.eq(200)     
                    // get totalAfterPromoCode
                    const totalAfterPromoCode = shoppingCartRespAfterPromo.body['subTotal'] 
                    // 2 totals should be same
                    expect(shoppingCartRespAfterPromo).to.eq(totalBeforePromoCode)          
                })
            })
        })
    });
})