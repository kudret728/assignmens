/*
User story:
            As a buyer, I want to get discount when I purchase 5 items of same products so that I'm incentivized to buy more.

Scenarios: 
            Discount: When buy 5 items of SAME product.

            Discount based on item numner:
            1. When shopping cart has 5 items of 1 product, discount is applied so validate total = discounted total.
            2. When shopping cart has 4 items of 1 product, discount is NOT applied so validate total = original total.
                    These scenarios are not tested, these are with multiple products. Will be more complicated but is doable
                    3. When shopping cart has 6 items of product a, 1 item of product b, discount is applied to product a so validate total = discounted total of a + original total of b.
                    4. When shopping cart has 3 items of product a, 2 items of product b, discount is NOT applied so validate total = original total.
                    5. When shopping cart has 5 items of product a, 6 items of product b, discount is applied to both products so total = discounted total of product a + discounted total of product b

            Discount based on promo code:
            1. When shopping cart is qualified for item number discount, and promo code is applied, compare the 2 discounted amount and apply the one with high savings for the consumer.
            2. When shopping cart is NOT qualify for item number discount, and promo code is applied, total = discounted total based on promo code
*/

/*
    Assume we have below methods imported from a file storing all the reusable methods
    - goToShoppingCart()                - this method will take the user to the shopping cart page
    - enterPromoCode(promocode, rate)   - this method will enter the promo code in the correct field and submit the code
    - enterPaymentInformatoin()         - this method will enter the banking information to correct fields
*/

describe('Given as a buyer I want to get discount when I am qualify for: ', () => {
    const promoCodeRate = 0.15

    before(() => {
        // assume we have a method goToShoppingCart() that takes me directly to the shopping cart
        cy.goToShoppingCart();      
    })

    it('A. When my items in my shopping cart is qualify for discount.', () => {
         // assume we have totalAmount elem
        cy.get('#totalAmount').invoke('text').then((originalTotal) => {  ent
        
        // assume we have itemCount element
        cy.get('#itemCount').invoke('text').then((itemCount) => {   
       
         // assume we have singleItemPrice element
        cy.get('#singleItemPrice').invoke('text').then((pricePerItem) => {   
                    // IF less than 5 items, DISCOUNT NOT APPLIED
                    if (itemCount < 5) {                                            
                        expect(originalTotal).to.equal(pricePerItem * itemCount)      
                        console.log('ITEM NUMBER DISCOUNT NOT APPLIED')  

                        // TESTING PROMO CODE DISCOUNT
                         // assume we have a method enterPromoCode() to enter promo code xxx-xxx-xxxx with 15% discount
                        cy.enterPromoCode('xxx-xxx-xxxx', promoCodeRate)              
                        cy.get('#totalAmount').invoke('text').then((promoTotalAmount1) => {
                            expect(promoTotalAmount1).to.equal(originalTotal * (1 - promoCodeRate))
                            console.log('PROMOCODE DISCOUNT APPLIED')
                        })
                     }    
                     // IF equal or more than 5 items, DISCOUNT APPPLIED    
                    else if (itemCount >= 5) {    
                        // discount 1 item for every 5 items                                   
                        let discountedDeduction = Math.floor(itemCount / 5) * pricePerItem             
                        let newTotalAmount = (itemCount * pricePerItem) - discountedDeduction;
                        cy.get('#totalAmount').invoke('text').then((discountedTotal) => {
                            expect(discountedTotal).to.equal(newTotalAmount)        
                            console.log('ITEM NUMBER DISCOUNT APPLIED')
                        })
                        
                        // TESTING PROMO CODE DISCOUNT
                        // assume we have a method enterPromoCode() to enter promo code xxx-xxx-xxxx with 15% discount
                        cy.enterPromoCode('xxx-xxx-xxxx', promoCodeRate)               
                        let promoTotal = (itemCount * pricePerItem) * (1 - promoCodeRate);
                        let expectedTotal = Math.min(newTotalAmount, promoTotal)    
                        // compare and find the lower total, higher savings for the consumers
                        cy.get('#totalAmount').invoke('text').then((promoTotalAmount2) => {
                            expect(promoTotalAmount2).to.equal(expectedTotal)
                            console.log('PROMOCODE DISCOUNT APPLIED')
                        })
                    }
                })
            }) 
        })
        // assume we have a button element with classname processToCheckout to go to payment page
        cy.get('#processToCheckout').click()            
        cy.enterPaymentInformatoin();
        // assume we have a button element with classname submitPayment 
        cy.get('#submitPayment').click()   
        // assume we have a confirmation message element with classname confirmationMessage             
        cy.get('#confirmationMessage').invoke('text').then((confirmMsg) => {    
            expect(confirmMsg).equal('Payment successful! Purchase completed!')
        })
    });
})