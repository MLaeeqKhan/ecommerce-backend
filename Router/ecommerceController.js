const express = require("express");
const router = express.Router();
router.use(express.json());
const cloudinary = require("../Middleware/cloudinay");
const Product = require("../Models/ProductSchema");
const AddToCart = require("../Models/AddToCartSchema");
// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });

const stripe = require("stripe")(process.env.STRIPE_SECRRT);

// router.post("/postProduct", upload.single("image"), async (req, res) => {
//   const {
//     productName,
//     productDescription,
//     stockQuantity,
//     productPrice,
//     category,
//   } = req.body;
//   const image = req.file; // Get the uploaded image file from req.file

//   console.log("Products Name:", productName);
//   console.log("Products productImg:", image);
//   console.log("Products productDescription:", productDescription);
//   console.log("Products productPrice:", productPrice);
//   console.log("Products stockQuantity:", stockQuantity);
//   console.log("Products category:", category);

//   try {
//     if (
//       !image ||
//       !productName ||
//       !productDescription ||
//       !productPrice ||
//       !stockQuantity ||
//       !category
//     ) {
//       return res.status(422).send("Please Fill All Fields!");
//     }

//     const result = await cloudinary.uploader.upload(image.path, {
//       folder: "products",
//     });

//     const product = await Product.create({
//       image: {
//         public_id: result.public_id,
//         url: result.secure_url,
//       },
//       productName,
//       productDescription,
//       productPrice,
//       stockQuantity,
//       category,
//     });

//     res.status(200).send("Product Posted Successfully");
//   } catch (error) {
//     console.log("error", error);
//     res.status(500).send("postProduct Internal Server error!");
//   }
// });

router.get("/getProducts", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (error) {
    console.log("error", error);
    res.send(error);
  }
});

// Delete products by product ID
router.delete("/deleteProducts/:productId", async (req, res) => {
  const { productId } = req.params;
  console.log("productId:", productId);
  try {
    await Product.deleteOne({ _id: productId });
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "deleteProducts Internal server error" });
  }
});

router.post("/addToCart", async (req, res) => {
  const { productId, userId, quantity } = req.body;

  if (!productId || !userId || !quantity) {
    return res.status(400).send("Product ID and quantity are required.");
  }

  try {
    const cart = new AddToCart({ productId, userId, quantity });
    await cart.save();
    res.status(200).send("Product Successfully Added To Cart!");
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).send("Internal Server Error while adding product to cart.");
  }
});

router.get("/getCartData/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const cartProduct = await AddToCart.find({ userId }).populate("productId");
    if (!cartProduct || cartProduct.length === 0) {
      return res.status(404).send("Empty Cart!");
    }
    res.json({ cartProduct });
  } catch (error) {
    console.error("getCartData error:", error);
    res
      .status(500)
      .send("getCartData: Internal Server Error while fetching cart data.");
  }
});

// Delete cart Product by cart Product ID
router.delete(
  "/deleteCartProductsAfterPayment/:cartProductId",
  async (req, res) => {
    const { cartProductId } = req.params;
    console.log("productId:", cartProductId);
    try {
      await AddToCart.deleteOne({ _id: cartProductId });
      res.sendStatus(204);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "deleteCartProducts Internal server error" });
    }
  }
);

// Delete cart Product by cartProduct's userId after successfull payment
router.delete("/deleteCartProducts/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("productId:", userId);
  try {
    await AddToCart.deleteMany({ userId: userId });
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "deleteCartProducts Internal server error" });
  }
});

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { products } = req.body;
    console.log("products:", products);
    let userId;
    const lineItems = products.map((product) => {
      const price = parseFloat(
        product.productId.productPrice.replace(/[^0-9.-]+/g, "")
      );
      const unitAmount = Math.round(price * 100);
      userId = product.userId;
      if (isNaN(unitAmount)) {
        throw new Error(
          `Invalid product price for product ID: ${product.productId._id}`
        );
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.productId.productName,
            images: [product.productId.image.url],
          },
          unit_amount: unitAmount,
        },
        quantity: product.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/paymentSuccess",
      cancel_url: "http://localhost:3000/paymentCancel",
    });
    console.log("session=======", session);
    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
