async function loadCartItems() {

    const response = await fetch("LoadCartItems");

    const popup = Notification();

    if (response.ok) {
        const json = await response.json();

        if (json.length === 0) {
            popup.info({
                message: "No items available in your cart"
            });
        } else {

            let cartItemContainer = document.getElementById("cartItemContainer");
            let cartItemRow = document.getElementById("cartItemRow");
            cartItemContainer.innerHTML = "";

            let totalQty = 0;
            let total = 0;

            console.log(json);

            json.forEach(item => {

                let itemSubtotal = item.product.price * item.qty;
                total += itemSubtotal;

                totalQty += item.qty;

                let cartItemRowClone = cartItemRow.cloneNode(true);


                console.log("Product ID:", item.product.id);

                //remove from the cart fuction calling
                cartItemRowClone.querySelector("#cartItemId").addEventListener("click", (e) => {
                    removeFromCart(item.product.id);
                    e.preventDefault();
                });
                console.log(item.product.price);
                //cart item value setting
//                cartItemRowClone.querySelector("#cartItemA").href = "single-product.html?pid=" + item.product.id;
                cartItemRowClone.querySelector("#cartItemImage").src = "product_images/" + item.product.id + "/image1.png";
                cartItemRowClone.querySelector("#cartItemTitle").innerHTML = item.product.title;
                cartItemRowClone.querySelector("#cartItemPrice").innerHTML = new Intl.NumberFormat(
                        "en-US",
                        {
                            minimumFractionDigits: 2
                        }
                ).format(item.product.price);

                cartItemRowClone.querySelector("#cartItemQty").innerHTML = item.qty;
                cartItemRowClone.querySelector("#cartItemSubtotal").innerHTML = new Intl.NumberFormat(
                        "en-US",
                        {
                            minimumFractionDigits: 2
                        }
                ).format((itemSubtotal));
                cartItemContainer.appendChild(cartItemRowClone);
            });

            document.getElementById("cartTotalQty").innerHTML = totalQty;
            document.getElementById("cartTotal").innerHTML = new Intl.NumberFormat(
                    "en-US",
                    {
                        minimumFractionDigits: 2
                    }
            ).format((total));
        }

    } else {
        popup.error({
            message: "Unable to process your request"
        });
    }

}


async function removeFromCart(pid) {

    const response = await fetch("RemoveFromCart?pid=" + pid);

    const popup = Notification();

    if (response.ok) {
        const json = await response.json();
        if (json.success) {
            location.reload();
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