package controller;

import com.google.gson.Gson;
import dto.Cart_DTO;
import dto.Response_DTO;
import dto.User_DTO;
import entity.Cart;
import entity.Product;
import entity.User;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "RemoveFromCart", urlPatterns = {"/RemoveFromCart"})
public class RemoveFromCart extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Gson gson = new Gson();
        Response_DTO response_DTO = new Response_DTO();
        Session session = null;

        try {
            // Get the product ID from request
            String pid = request.getParameter("pid");

            if (pid == null || pid.isEmpty()) {
                response_DTO.setSuccess(false);
                response_DTO.setContent("Invalid product ID");
                writeResponse(response, gson.toJson(response_DTO));
                return;
            }

            // Check if user is logged in
            User_DTO user_dto = (User_DTO) request.getSession().getAttribute("user");

            if (user_dto == null) { // User not logged in, use session cart
                @SuppressWarnings("unchecked")
                ArrayList<Cart_DTO> sessionCart = (ArrayList<Cart_DTO>) request.getSession().getAttribute("sessionCart");

                if (sessionCart != null) {
                    boolean itemFound = false;

                    // Safely remove the item from session cart
                    Iterator<Cart_DTO> iterator = sessionCart.iterator();
                    while (iterator.hasNext()) {
                        Cart_DTO cart_DTO = iterator.next();
                        if (cart_DTO.getProduct().getId() == Integer.parseInt(pid)) {
                            iterator.remove();
                            itemFound = true;
                            response_DTO.setSuccess(true);
                            response_DTO.setContent("Product removed from session cart");
                            break;
                        }
                    }

                    if (!itemFound) {
                        response_DTO.setSuccess(false);
                        response_DTO.setContent("Product not found in session cart");
                    }
                } else {
                    response_DTO.setSuccess(false);
                    response_DTO.setContent("No session cart found");
                }
            } else { // User is logged in, use database cart
                session = HibernateUtil.getSessionFactory().openSession();
                session.beginTransaction();

                // Find the user in the database
                Criteria criteriaUser = session.createCriteria(User.class);
                criteriaUser.add(Restrictions.eq("email", user_dto.getEmail()));
                User user = (User) criteriaUser.uniqueResult();

                if (user == null) {
                    response_DTO.setSuccess(false);
                    response_DTO.setContent("User not found in database");
                } else {
                    // Find the product in the database
                    Criteria productCriteria = session.createCriteria(Product.class);
                    productCriteria.add(Restrictions.eq("id", Integer.parseInt(pid)));
                    Product product = (Product) productCriteria.uniqueResult();

                    if (product == null) {
                        response_DTO.setSuccess(false);
                        response_DTO.setContent("Product not found");
                    } else {
                        // Find the cart item in the database
                        Criteria cartCriteria = session.createCriteria(Cart.class);
                        cartCriteria.add(Restrictions.eq("product", product));
                        cartCriteria.add(Restrictions.eq("user", user));
                        Cart cartItem = (Cart) cartCriteria.uniqueResult();

                        if (cartItem != null) {
                            session.delete(cartItem);
                            session.getTransaction().commit();
                            response_DTO.setSuccess(true);
                            response_DTO.setContent("Product removed from database cart");
                        } else {
                            response_DTO.setSuccess(false);
                            response_DTO.setContent("Product not found in database cart");
                        }
                    }
                }
            }
        } catch (NumberFormatException e) {
            response_DTO.setSuccess(false);
            response_DTO.setContent("Invalid product ID format");
        } catch (Exception e) {
            e.printStackTrace();
            response_DTO.setSuccess(false);
            response_DTO.setContent("An error occurred: " + e.getMessage());
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }

        // Write JSON response
        writeResponse(response, gson.toJson(response_DTO));
    }

    private void writeResponse(HttpServletResponse response, String jsonResponse) throws IOException {
        response.setContentType("application/json");
        response.getWriter().write(jsonResponse);
    }
}