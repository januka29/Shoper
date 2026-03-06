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
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import model.HibernateUtil;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "LoadCartItems", urlPatterns = {"/LoadCartItems"})
public class LoadCartItems extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        Gson gson = new Gson();
        HttpSession httpSession = request.getSession();
        ArrayList<Cart_DTO> cart_DTO_List = new ArrayList<>();
        Session session = HibernateUtil.getSessionFactory().openSession();

        try {

            if (httpSession.getAttribute("user") != null) {
                //DB Cart

                User_DTO user_DTO = (User_DTO) httpSession.getAttribute("user");

                //search user
                Criteria criteria1 = session.createCriteria(User.class);
                criteria1.add(Restrictions.eq("email", user_DTO.getEmail()));
                User user = (User) criteria1.uniqueResult();

                //search cart items for the user
                Criteria criteria2 = session.createCriteria(Cart.class);
                criteria2.add(Restrictions.eq("user", user));
                List<Cart> cartList = criteria2.list();

                for (Cart cart : cartList) {

                    Cart_DTO cart_DTO = new Cart_DTO();
                    
                    Product product = cart.getProduct();
                    product.setUser(null);
                    
                    cart_DTO.setProduct(product);

                    cart_DTO.setQty(cart.getQty());

                    cart_DTO_List.add(cart_DTO);

                }

            } else {
                //Session Cart
                System.out.println("session cart");

                if (httpSession.getAttribute("sessionCart") != null) {
                    System.out.println("cart not empty");
                    cart_DTO_List = (ArrayList<Cart_DTO>) httpSession.getAttribute("sessionCart");

                    for (Cart_DTO cart_DTO : cart_DTO_List) {
                        cart_DTO.getProduct().setUser(null);
                        System.out.println("setting users null");
                    }
                } else {
                    //cart empty
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        session.close();
        System.out.println("session closed");

        response.setContentType("application/json");
        System.out.println("content type set");

        response.getWriter().write(gson.toJson(cart_DTO_List));
        System.out.println("response sent");

    }

}
