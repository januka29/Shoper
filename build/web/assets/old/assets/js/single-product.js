async function loadProduct() {

    const parameters = new URLSearchParams(window.location.search);

    if (parameters.has("pid")) {
        const pid = parameters.get("pid");
        const response = await fetch("LoadSingleProduct?pid=" + pid);

        if (response.ok) {
            const json = await response.json();

            const id = json.product.id;
            document.getElementById("image1").src = "product_images/" + id + "/image1.png";
            document.getElementById("thumbnail1").href = "product_images/" + id + "/image1.png";
            document.getElementById("leftimage1").src = "product_images/" + id + "/image1.png";
            document.getElementById("image2").src = "product_images/" + id + "/image2.png";
            document.getElementById("thumbnail2").href = "product_images/" + id + "/image2.png";
            document.getElementById("leftimage2").src = "product_images/" + id + "/image2.png";
            document.getElementById("image3").src = "product_images/" + id + "/image3.png";
            document.getElementById("thumbnail3").href = "product_images/" + id + "/image3.png";
            document.getElementById("leftimage3").src = "product_images/" + id + "/image3.png";

            document.getElementById("title").innerHTML = json.product.title;
            document.getElementById("product-published-on").innerHTML = json.product.date_time;

            document.getElementById("product-price").innerHTML = new Intl.NumberFormat(
                    "en-US",
                    {
                        minimumFractionDigits: 2
                    }
            ).format(json.product.price);

            document.getElementById("product-category").innerHTML = json.product.model.category.name;
            document.getElementById("product-model").innerHTML = json.product.model.name;
            document.getElementById("product-condition").innerHTML = json.product.product_condition.name;
            document.getElementById("product-stock").innerHTML = json.product.qty;
            document.getElementById("color-border").style.borderColor = json.product.color.name;
            document.getElementById("color-background").style.backgroundColor = json.product.color.name;
            document.getElementById("product-storage").innerHTML = json.product.storage.value;
            document.getElementById("product-description").innerHTML = json.product.description;

            document.getElementById("add-to-cart-main").addEventListener("click", (e) => {
                addToCart(json.product.id, document.getElementById("add-to-cart-qty").value);
                e.preventDefault();
            });

            let productHtml = document.getElementById("similar-product");
            document.getElementById("similar-product-main").innerHTML = "";

            json.productList.forEach(item => {

                let productCloneHtml = productHtml.cloneNode(true);

                productCloneHtml.querySelector("#similar-product-a1").href = "single-product.html?pid=" + item.id;
                productCloneHtml.querySelector("#similar-product-image").src = "product_images/" + item.id + "/image1.png";
                productCloneHtml.querySelector("#similar-product-a2").href = "single-product.html?pid=" + item.id;
                productCloneHtml.querySelector("#similar-product-title").innerHTML = item.title;
                productCloneHtml.querySelector("#similar-product-storage").innerHTML = item.storage.value;
                productCloneHtml.querySelector("#similar-product-price").innerHTML = "Rs. " + new Intl.NumberFormat(
                        "en-US",
                        {
                            minimumFractionDigits: 2
                        }
                ).format(item.price);

                productCloneHtml.querySelector("#similar-product-color-border").style.borderColor = item.color.name;
                productCloneHtml.querySelector("#similar-product-color").style.backgroundColor = item.color.name;

                productCloneHtml.querySelector("#similar-product-add-to-cart").addEventListener("click", (e) => {

                    addToCart(item.id, 1);
                    e.preventDefault();

                });

                document.getElementById("similar-product-main").appendChild(productCloneHtml);
            });

            $('.recent-product-activation').slick({
                infinite: true,
                slidesToShow: 4,
                slidesToScroll: 4,
                arrows: true,
                dots: false,
                prevArrow: '<button class="slide-arrow prev-arrow"><i class="fal fa-long-arrow-left"></i></button>',
                nextArrow: '<button class="slide-arrow next-arrow"><i class="fal fa-long-arrow-right"></i></button>',
                responsive: [{
                        breakpoint: 1199,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    },
                    {
                        breakpoint: 991,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    },
                    {
                        breakpoint: 479,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            });

        } else {
            window.location = "index.html";
        }

    } else {
        window.location = "index.html";
    }

}

async function addToCart(pid, qty) {

    const response = await fetch("AddToCart?pid=" + pid + "&qty=" + qty);

    const popup = Notification();

    if (response.ok) {
        const json = await response.json();
        if (json.success) {
            popup.success({
                message: json.content
            });
        } else {
            popup.error({
                message: json.content
            });
        }
    } else {
        popup:error({
            message: "Unable to process your request"
        });
    }

}