package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import dto.User_DTO;
import entity.Address;
import entity.Cart;
import entity.City;
import entity.Order_Status;
import entity.Order_item;
import entity.Product;
import entity.User;
import java.io.IOException;
import java.text.DecimalFormat;
import java.util.Date;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import model.HibernateUtil;
import model.Payhere;
import model.Validations;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "Checkout", urlPatterns = {"/Checkout"})
public class Checkout extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        Gson gson = new Gson();

        JsonObject requestJsonObject = gson.fromJson(request.getReader(), JsonObject.class);

        JsonObject responseJsonObject = new JsonObject();
        responseJsonObject.addProperty("success", false);

        HttpSession httpSession = request.getSession();

        Session session = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = session.beginTransaction();

        boolean isCurrentAddress = requestJsonObject.get("isCurrentAddress").getAsBoolean();
        String firstName = requestJsonObject.get("firstName").getAsString();
        String lastName = requestJsonObject.get("lastName").getAsString();
        String cityId = requestJsonObject.get("cityId").getAsString();
        String address1 = requestJsonObject.get("address1").getAsString();
        String address2 = requestJsonObject.get("address2").getAsString();
        String postalCode = requestJsonObject.get("postalCode").getAsString();
        String mobile = requestJsonObject.get("mobile").getAsString();

        if (httpSession.getAttribute("user") != null) {
            //user signed in

            //get user from db
            User_DTO user_DTO = (User_DTO) httpSession.getAttribute("user");
            Criteria criteria1 = session.createCriteria(User.class);
            criteria1.add(Restrictions.eq("email", user_DTO.getEmail()));
            User user = (User) criteria1.uniqueResult();

            if (isCurrentAddress) {
                //get current address

                //get address from db
                Criteria criteria2 = session.createCriteria(Address.class);
                criteria2.add(Restrictions.eq("user", user));
                criteria2.addOrder(Order.desc("id"));
                criteria2.setMaxResults(1);

                if (criteria2.list().isEmpty()) {
                    //current address not found
                    responseJsonObject.addProperty("message", "Current address not found. Please create a new address");

                } else {
                    //get the current address
                    Address address = (Address) criteria2.list().get(0);

                    //***do the checkout process
                    saveOrders(session, transaction, user, address, responseJsonObject);
                }

            } else {
                //create new address

                if (firstName.isEmpty()) {
                    responseJsonObject.addProperty("message", "Please fill first name");

                } else if (lastName.isEmpty()) {
                    responseJsonObject.addProperty("message", "Please fill last name");

                } else if (!Validations.isInteger(cityId)) {
                    responseJsonObject.addProperty("message", "Invalid City");

                } else {
                    //check city from db

                    Criteria criteria3 = session.createCriteria(City.class);
                    criteria3.add(Restrictions.eq("id", Integer.parseInt(cityId)));

                    if (criteria3.list().isEmpty()) {
                        responseJsonObject.addProperty("message", "Invalid city selected");

                    } else {
                        //city found
                        City city = (City) criteria3.list().get(0);

                        if (address1.isEmpty()) {
                            responseJsonObject.addProperty("message", "Please fill address line 1");

                        } else if (address2.isEmpty()) {
                            responseJsonObject.addProperty("message", "Please fill address line 2");

                        } else if (postalCode.isEmpty()) {
                            responseJsonObject.addProperty("message", "Please fill postal code");

                        } else if (postalCode.length() != 5) {
                            responseJsonObject.addProperty("message", "Invalid postal code");

                        } else if (!Validations.isInteger(postalCode)) {
                            responseJsonObject.addProperty("message", "Invalid postal code");

                        } else if (mobile.isEmpty()) {
                            responseJsonObject.addProperty("message", "Please fill mobile number");

                        } else if (!Validations.isMobileNumberValid(mobile)) {
                            responseJsonObject.addProperty("message", "Invalid mobile number");

                        } else {
                            //create new address

                            Address address = new Address();
                            address.setCity(city);
                            address.setFirst_name(firstName);
                            address.setLast_name(lastName);
                            address.setLine1(address1);
                            address.setLine2(address2);
                            address.setMobile(mobile);
                            address.setPostal_code(postalCode);
                            address.setUser(user);

                            session.save(address);

                            //***complete the checkout process
                        }
                    }

                }
            }

        } else {
            //user not signed in
            responseJsonObject.addProperty("message", "User not signed in");
        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseJsonObject));

    }

    private void saveOrders(Session session, Transaction transaction, User user, Address address, JsonObject responseJsonObject) {
        try {
            //create order in DB
            entity.Product_Order order = new entity.Product_Order();
            order.setAddress(address);
            order.setDate_time(new Date());
            order.setUser(user);
            int order_id = (int) session.save(order);

            //get cart items
            Criteria criteria4 = session.createCriteria(Cart.class);
            criteria4.add(Restrictions.eq("user", user));
            List<Cart> cartList = criteria4.list();

            //get order status (1.Paiad) from DB
            Order_Status order_Status = (Order_Status) session.get(Order_Status.class, 1);

            //create order item in DB
            double amount = 0;
            String items = "";
            for (Cart cartItem : cartList) {

                //calculate amount
                amount += cartItem.getProduct().getPrice() * cartItem.getQty();
                if (address.getCity().getId() == 1) {
                    amount += 1000;
                } else {
                    amount += 2500;
                }
                //calculate amount

                //Get Item details
                items += cartItem.getProduct().getTitle() + " x" + cartItem.getQty() + "";
                //Get Item details

                Product product = cartItem.getProduct();

                Order_item order_item = new Order_item();
                order_item.setOrder(order);
                order_item.setOrder_status(order_Status);
                order_item.setProduct(product);
                order_item.setQty(cartItem.getQty());
                session.save(order_item);

                //update product qty in DB
                product.setQty(product.getQty() - cartItem.getQty());
                session.update(product);

                //delete cart item from DB
                session.delete(cartItem);

            }

            transaction.commit();

            //set payment data (start)
            String merchant_id = "1221039";
            String formatted_amount = new DecimalFormat("0.00").format(amount);
            String currency = "LKR";
            String merchantSecret = "NDI3OTU5NDM2MjI2NTU4MjMyNjE4MzI1NzE5MTUyMjAyMzM2MDIz"; //**
            String merchantSecretMdHash = Payhere.generateMD5(merchantSecret);

            JsonObject payhere = new JsonObject();
            payhere.addProperty("merchant_id", merchant_id);

            payhere.addProperty("return_url", "");
            payhere.addProperty("cancel_url", "");
            payhere.addProperty("notify_url", ""); //*

            payhere.addProperty("first_name", user.getFirst_name());
            payhere.addProperty("last_name", user.getLast_name());
            payhere.addProperty("email", user.getEmail());

            payhere.addProperty("phone", "");
            payhere.addProperty("address", "");
            payhere.addProperty("city", "");
            payhere.addProperty("country", "");

            payhere.addProperty("order_id", String.valueOf(order_id));
            payhere.addProperty("items", items);
            payhere.addProperty("currency", "LKR");
            payhere.addProperty("amount", formatted_amount);
            payhere.addProperty("sandbox", true);

            //Generate MD5 Hash
            //merahantID + orderID + amountFormatted + currency + getMd5(merchantSecret)
            String md5Hash = Payhere.generateMD5(merchant_id + order_id + formatted_amount + currency + merchantSecretMdHash);
            payhere.addProperty("hash", md5Hash);

            //set payment data (end)
            responseJsonObject.addProperty("success", true);
            responseJsonObject.addProperty("message", "Checkout completed");

            Gson gson = new Gson();
            responseJsonObject.add("payhereJson", gson.toJsonTree(payhere));

        } catch (Exception e) {
            transaction.rollback();
        }
    }

}