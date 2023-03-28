import express, {Request, Response, NextFunction, request, response } from 'express';
import {products} from './data';
import { body, param, validationResult } from 'express-validator';


const  app  =  express ();

app.use(express.json());

  


const Errors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
  };

    const getProductById = (req: Request, res: Response, next: NextFunction) => {
      const id = Number(req.params.id)
      let product = products.find((item) => item.id === id);
      if (!product) {
        return res.status(404).json({ message: "product not found" });
      }
      res.locals.product = product;
      next();
    };



  /*
    const isAuth = ({headers}: Request, res: Response, next: NextFunction) => {
      if (headers.authorization === "pippo") {
        next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    };
    */

    

    // const logHttpReq = (req: Request, res: Response) => {
    //   console.log(req.originalUrl);
    // };

    app.get("/products",(req,res) => {
      res.status(200).json({success : true, data: products})
    });
    
    
      app.get("/products",({query},res) =>{
        let productsCopy = [...products]
        if (query.brand){
         productsCopy =  productsCopy.filter(item => item.brand === query.brand)
        }
        if (query.price){
          productsCopy =  productsCopy.filter(item => item.price.toString() === query.price)
         }
         res.status(200).json({success : true, data: productsCopy})
      });
      

      //GET BY ID
      app.get(
        "/products/:id",
        getProductById,
        param("id").exists().isNumeric(),
           Errors,
        (req, res, next) => {
          res.json(res.locals.product);
          next();
        }
      );


    // POST
  app.post("/products",
  
  body('brand').exists().isString(),
  body('price').exists().isNumeric(),
  Errors,({body}:express.Request,res:express.Response) =>{
   
      const maxID = products.reduce(
        (acc,item) => acc > item.id ? acc : item.id,0);//Math.max(...products.map(item) => item.id)
      let product= {
        id : maxID +1,
        brand : body.brand,
        price: body.price
      };
      products.push(product);
      res.json(product);
      res.status(201).json({message:"Products added in DB"});
      });

  // DELETE
      app.delete("/products/:id",param('id').exists(),Errors, (req, res) => {
        const id = req.params.id
        const productIndex = products.findIndex((item) => item.id === Number(id));
        products.splice(productIndex, 1);
        res.json({ message: "item deleted" });
      });
    
    
  // PUT
      app.put(
        "/products/:id",
        getProductById,
        param("id").exists().isNumeric(),
        body('brand').isString(),
        body('price').isNumeric(),
           Errors,
        ({ body }: express.Request, res: express.Response) => {
          res.locals.product.brand = body.brand;
          res.locals.product.price = body.price;
          res.json(res.locals.product);
        }
      );



  app.all('*',(req,res) => {
  res.send("<h1>Resource not found</h1>")
});
    
   
app.listen(3000, () => {
    console.log("Server is running")
  }); 



