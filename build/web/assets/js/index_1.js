async function checkSignIn() {

    const response = await fetch("CheckSignIn");

    if (response.ok) {

        const json = await response.json();

        const response_dto = json.response_dto;

        if (response_dto.success) {
            // signed in

            const user = response_dto.content;

            let st_quick_link = document.getElementById("st-quick-link");

            let st_quick_link_li_1 = document.getElementById("st-quick-link-li-1");
            let st_quick_link_li_2 = document.getElementById("st-quick-link-li-2");

            st_quick_link_li_1.remove();
            st_quick_link_li_2.remove();

            let new_li_tag1 = document.createElement("li");
            let new_li_a_tag1 = document.createElement("a");
            new_li_a_tag1.href = "#";
            new_li_a_tag1.innerHTML = user.first_name + " " + user.last_name;
            new_li_tag1.appendChild(new_li_a_tag1);
            st_quick_link.appendChild(new_li_tag1);

            let st_button_1 = document.getElementById("st-button-1");
            st_button_1.href = "SignOut";
            st_button_1.innerHTML = "Sign Out";

            let st_div_1 = document.getElementById("st-div-1");
            st_div_1.remove();

        } else {
            //  not signed in
            console.log("not signed in");
        }

        //display last 3 products
        const productList = json.products;

        let i = 1;
        productList.forEach(product => { 
            document.getElementById("st-product-title-" + i).innerHTML = product.title;
            document.getElementById("st-product-link-" + i).href = "single-product.html?pid=" + product.id;
            document.getElementById("st-product-image-" + i).src = "product_images/" + product.id + "/image1.png";
            document.getElementById("st-product-price-" + i).innerHTML = new Intl.NumberFormat(
                    "en-US",
                    {
                        minimumFractionDigits: 2
                    }
            ).format((product.price));
            i++;
        });

        $('.slider-content-activation-one').slick({
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            dots: false,
            focusOnSelect: false,
            speed: 500,
            fade: true,
            autoplay: false,
            asNavFor: '.slider-thumb-activation-one'
        });

        $('.slider-thumb-activation-one').slick({
            infinite: true,
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: false,
            dots: true,
            focusOnSelect: false,
            speed: 1000,
            autoplay: true,
            asNavFor: '.slider-content-activation-one',
            prevArrow: '<button class="slide-arrow prev-arrow"><i class="fal fa-long-arrow-left"></i></button>',
            nextArrow: '<button class="slide-arrow next-arrow"><i class="fal fa-long-arrow-right"></i></button>',
            responsive: [{
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]

        });
    }
}

async function viewCart() {

    const response = await fetch("cart.html");

    if (response.ok) {
        const cartHtmlText = await response.text();
        //const parser = new DOMParser();
        //const cartHtml = parser.parseFromString(cartHtmlText, "text/html");
        //const cartMain = cartHtml.querySelector("#cart-main");
        //document.querySelector("#index-main").innerHTML = cartMain.innerHTML;
        //filters use karoth url eken yana eka nawaththanna puluwan
        document.querySelector("#index-main").innerHTML = cartHtmlText;
        loadCartItems();
    }

}

//async function loadProduct() {
//    const response = await fetch("LoadProduct");
//
//    if (response.ok) {
//        const json = await response.json();
//
//        if (json.success) {
//            const productList = json.productList;
//
//            if (productList.length === 0) {
//                console.log("empty items");
//            } else {
//                let productItemContainer = document.getElementById("productItemContainer");
//                let productItem = document.getElementById("productItem");
//
//                productItemContainer.innerHTML="";
//
//                console.log(productList);
//
//               productList.forEach(item => {
//    // Clone the product template
//    let productItemTemplate = document.querySelector('[data-product-template]');
//    let productItemClone = productItemTemplate.cloneNode(true);
//
//    // Update cloned content using data-* selectors
//    productItemClone.querySelector('[data-product-link]').href = "product.html?pid=" + item.id;
//    productItemClone.querySelector('[data-product-image]').src = "product_images/" + item.id + "/image1.png";
//    productItemClone.querySelector('[data-product-name]').innerHTML = item.title;
//    productItemClone.querySelector('[data-product-price]').innerHTML = new Intl.NumberFormat(
//        "en-US", { minimumFractionDigits: 2 }
//    ).format(item.price);
//
//    // Append the updated clone
//    document.getElementById("productItemContainer").appendChild(productItemClone);
//});
//
//                
//                $('.recent-product-activation').slick({
//                infinite: true,
//                slidesToShow: 4,
//                slidesToScroll: 4,
//                arrows: true,
//                dots: false,
//                prevArrow: '<button class="slide-arrow prev-arrow"><i class="fal fa-long-arrow-left"></i></button>',
//                nextArrow: '<button class="slide-arrow next-arrow"><i class="fal fa-long-arrow-right"></i></button>',
//                responsive: [{
//                        breakpoint: 1199,
//                        settings: {
//                            slidesToShow: 3,
//                            slidesToScroll: 3
//                        }
//                    },
//                    {
//                        breakpoint: 991,
//                        settings: {
//                            slidesToShow: 2,
//                            slidesToScroll: 2
//                        }
//                    },
//                    {
//                        breakpoint: 479,
//                        settings: {
//                            slidesToShow: 1,
//                            slidesToScroll: 1
//                        }
//                    }
//                ]
//            });
//
//                
//            }
//        } else {
//            console.log(json.message);
//        }
//    } else {
//        console.log("bad req");
//    }
//}

async function loadProduct() {
    const productItemContainer = document.getElementById("productItemContainer");
    const productItemTemplate = document.querySelector("[data-product-template]");

    try {
        // Fetch product data
        const response = await fetch("LoadProduct");

        // Handle response errors
        if (!response.ok) throw new Error("Network error: Failed to fetch product data");

        const data = await response.json();

        // Handle backend errors
        if (!data.success) throw new Error(data.message || "Failed to load products");

        const productList = data.productList;

        // Clear existing content
        productItemContainer.innerHTML = "";

        // Check if product list is empty
        if (productList.length === 0) {
            console.log("No products available.");
            return;
        }

        // Use DocumentFragment for efficient DOM manipulation
        const fragment = document.createDocumentFragment();

        productList.forEach(item => {
            // Clone the product template
            const productClone = productItemTemplate.cloneNode(true);

            // Update product details
            productClone.querySelector("[data-product-link]").href = `product.html?pid=${item.id}`;
            productClone.querySelector("[data-product-image]").src = `product_images/${item.id}/image1.png`;
            productClone.querySelector("[data-product-name]").textContent = item.title;
            productClone.querySelector("[data-product-price]").textContent = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            }).format(item.price);

            // Append the updated clone to the fragment
            fragment.appendChild(productClone);
        });

        // Append all clones to the container
        productItemContainer.appendChild(fragment);

        // Initialize or reinitialize Slick Slider
        if ($(productItemContainer).hasClass("slick-initialized")) {
            $(productItemContainer).slick("unslick");
        }

        $(productItemContainer).slick({
            infinite: true,
            slidesToShow: 4,
            slidesToScroll: 4,
            arrows: true,
            dots: false,
            prevArrow: '<button class="slide-arrow prev-arrow"><i class="fal fa-long-arrow-left"></i></button>',
            nextArrow: '<button class="slide-arrow next-arrow"><i class="fal fa-long-arrow-right"></i></button>',
            responsive: [
                { breakpoint: 1199, settings: { slidesToShow: 3, slidesToScroll: 3 } },
                { breakpoint: 991, settings: { slidesToShow: 2, slidesToScroll: 2 } },
                { breakpoint: 479, settings: { slidesToShow: 1, slidesToScroll: 1 } }
            ]
        });

    } catch (error) {
        console.error("Error loading products:", error.message);
    }
}
