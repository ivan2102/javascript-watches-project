//contentful
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "0iav0leutg8c",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "EbPNrRs71OQlGnwsMaKSUk-TMKoMVGwgxRArmahWXxY"
  });

//variables
const cartBtn = document.querySelector('.cart-btn');
const cartItems = document.querySelector('.cart-items');
const productsCenter = document.querySelector('.products-center');
const cartOverlay = document.querySelector('.cart-overlay');
const cartDOM = document.querySelector('.cart');
const closeCart = document.querySelector('.close-cart');
const cartContent = document.querySelector('.cart-content');
const cartTotal = document.querySelector('.cart-total');
const clearCart = document.querySelector('.clear-cart');
//cart
let cart = [];
//buttons
let buttonsDOM = [];

//classes

//getProducts
class Products {

   async getProducts() {

        try{

             let contentful = await client.getEntries({

                content_type: 'watchesProducts'
             });
            

           // let result = await fetch('products.json');
           //let data = await result.json();
            let products = contentful.items;

            products = products.map(item => {

                let {id} = item.sys;
                let {title,price} = item.fields;
                let image = item.fields.image.fields.file.url;


                return {
                    id,
                    title,
                    price,
                    image
                }
            });

            return products;

        }
        catch(error) {
           
            console.log(error);
        }
    }

}

//displayProducts
class UI {

    displayProducts(products) {
        
        let result = '';
        products.forEach(product => {

         result += `<div class="product">
            <div class="img-container">
          <img src=${product.image} class="product-img" alt="images">
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i>add to cart
          </button>
          </div>
          <h3>${product.title}</h3>
          <h4>${product.price}</h4>
          </div>`


        });

        productsCenter.innerHTML = result;

     
    }


    getBagButtons() {

     const buttons = [...document.querySelectorAll('.bag-btn')];

     buttonsDOM = buttons;

     buttons.forEach(button => {
      
        let id = button.dataset.id;

        let inCart =  cart.find(item => item.id === id);

        if(inCart) {
     
         button.disabled = true;
         button.innerText = 'In Cart';
     
        }
        
     
         button.addEventListener('click', event => {
     
             event.target.disabled = true;
             event.target.innerText = 'In Cart';


         //get product from products(DOM) based on button id
         let cartItem = {...Storage.getProduct(id), amount: 1};
         //add product to the cart
         cart = [...cart, cartItem];
         //save cart to local storage
         Storage.saveCart(cart);
         //set cart values
         this.setCartValues(cart);
         //add item to the cart
         this.addItemToTheCart(cartItem);
         //show cart and cart overlay
         this.showCart();
         });

       });

     }


     setCartValues(cart) {

       let tempTotal = 0;
      let  itemsTotal = 0;

      cart.map(item => {

        tempTotal += item.price * item.amount;
        itemsTotal += item.amount;
      });

      cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
      cartItems.innerText = itemsTotal;
      

      
     }


     addItemToTheCart(item) {

       let div = document.createElement('div');
       div.classList.add('cart-item');

       div.innerHTML = ` 
        <img src=${item.image} alt="watch">
 
        <div>
          <h4>${item.title}</h4>
          <h5>$${item.price}</h5>
          <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
  
        <div>
          <i class="fas fa-chevron-up" data-id=${item.id}></i>
          <p class="item-amount">${item.amount}</p>
          <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`

        cartContent.appendChild(div);


     }

     showCart() {

        cartDOM.classList.add('showCart');
        cartOverlay.classList.add('transparentBcg');
     }

     hideCart() {

        cartDOM.classList.remove('showCart');
        cartOverlay.classList.remove('transparentBcg');
     }


     setupAPP() {
          
       cart = Storage.getCart();
       this.setCartValues(cart);
       this.populateCart(cart);

       cartBtn.addEventListener('click', this.showCart);
       closeCart.addEventListener('click', this.hideCart);

    }

    populateCart(cart) {
      
        cart.forEach(item => this.addItemToTheCart(item));

    }


    cartLogic() {
       //clear cart button
        clearCart.addEventListener('click', () => {

            this.clearCart();
        });

        //cart functionality

        cartContent.addEventListener('click', event => {

            if(event.target.classList.contains('remove-item')) {
                 let removeItem = event.target;
                let id = removeItem.dataset.id;
                this.removeItem(id);
                cartContent.removeChild(removeItem.parentElement.parentElement);
            }
            else if(event.target.classList.contains('fa-chevron-up')) {

                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                this.setCartValues(cart);
                Storage.saveCart(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(event.target.classList.contains('fa-chevron-down')) {

                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0) {

                    this.setCartValues(cart);
                    Storage.saveCart(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;  
                    }
                    else {

                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                    }
                
            }
        })

    }

        clearCart() {

            let cartItems = cart.map(item => item.id);
            cartItems.forEach(id => this.removeItem(id));

            //clear the cart from the DOM
            while(cartContent.children.length > 0) {

                cartContent.removeChild(cartContent.children[0]);
            }

            this.hideCart();
        }

        removeItem(id) {

            cart = cart.filter(item => item.id !== id);
            this.setCartValues(cart);
            Storage.saveCart(cart);
            let button = this.getSingleButton(id);
            button.disabled = false;
            button.innerHTML = `<i class='fas fa-shopping-cart'></i>add to cart`
        }

        getSingleButton(id) {

            return buttonsDOM.find(button => button.dataset.id === id);
        }
    

     

}

//Storage
class Storage {

    static saveProducts(products) {

        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id) {

        let products = JSON.parse(localStorage.getItem('products'));

        return products.find(product => product.id === id);
    }

    static saveCart(cart) {

        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart() {

        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }

}

document.addEventListener('DOMContentLoaded', () =>  {

    const products = new Products();
    const ui = new UI();

    //setup application
    ui.setupAPP();

    products.getProducts().then(products => {
      
        ui.displayProducts(products);
        Storage.saveProducts(products);

    }).then(() => {

        ui.getBagButtons();
        ui.cartLogic();
    });

    
   

});