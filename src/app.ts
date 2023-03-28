import express, {Request, Response, NextFunction } from 'express';
import {products} from './data';

const  app  =  express ();

app.use(express.json());

  
  
    app.get("/products",({query},res) =>{
      let productsCopy = [...products]
      if (query.brand){
       productsCopy =  productsCopy.filter(item => item.brand === query.brand)
      }
      if (query.price){
        productsCopy =  productsCopy.filter(item => item.price.toString() === query.price)
       }
      res.json(productsCopy)
    });


 
/*
      //Ordine crescente
      app.get("/products/:price/ascendingorder",(req,res) =>{
        const maxPrice = [...products].sort((a,b) => (a.price - b.price));
        res.json(maxPrice);
      });
      //Ordine decrescente
      app.get("/products/:price/descendingorder",(req,res) =>{
        const maxPrice = [...products].sort((a,b) => (b.price - a.price));
        res.json(maxPrice);
      });
  */

    //Max Price


    app.get('/products/price/maxprice',(req,res)=>{
      const maxPrice = [...products].filter(item => item.price === Math.max(...products.map(item => item.price)));
      res.json(maxPrice);
  });


     //Min Price

    app.get('/products/price/minprice',(req,res)=>{
    const minPrice = [...products]
    .filter(item => item.price === Math.min(...products.map(item => item.price)));
    res.json(minPrice);
});




    const checkIdIsNumber = (req: Request, res : Response, next: NextFunction) => {
      const id = Number(req.params.id);
      if(isNaN(id)) {
        return res.status(400).json({message: "id is not a number"});
      }
      res.locals.id = id;
      next();
    };

    const getProductById = (req: Request, res: Response, next: NextFunction) => {
      let product = products.find((item) => item.id === res.locals.id);
      if (!product) {
        return res.status(404).json({ message: "product not found" });
      }
      res.locals.product = product;
      next();
    };

    const checkIfBodyIsRight = ({body}: Request, res:Response,next: NextFunction) =>{
      if(body.id && body.brand && body.price){
      next();
      }else{
        res.status(400)
        .json({message: "missing field"})
      }
    }

  
    const isAuth = ({headers}: Request, res: Response, next: NextFunction) => {
      if (headers.authorization === "pippo") {
        next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    };

    const logHttpReq = (req: Request, res: Response) => {
      console.log(req.originalUrl);
    };


    
    
  app.post("/products",isAuth,checkIfBodyIsRight,({body},res) =>{
  
      const maxID = products.reduce(
        (acc,item) => acc > item.id ? acc : item.id,0);
      let product= {
        id : maxID +1,
        brand : body.brand,
        price: body.price
      };
      //Math.max(...products.map(item) => item.id)
      products.push(product);
      res.json(product);
      res.send("Products added in DB");
      });
  

  app.delete("/products/:id",isAuth,checkIdIsNumber,(req,res) => {
    let productIndex = products.findIndex((item)=> item.id === res.locals.id );
    if(productIndex === -1){
      return res.status(404).json({message: "products not found"});
    }
    products.splice(productIndex,1);
    res.json({message: "Item deleted"})
  })


  app.put("/products/:id" ,isAuth,checkIdIsNumber,getProductById,checkIfBodyIsRight,({body},res) => {
    res.locals.product.id = body.id;
    res.locals.product.brand = body.brand;
    res.locals.product.price = body.price;
    res.json(res.locals.product);
  });


  app.get(
    "/products/:id",
    checkIdIsNumber,
    getProductById,
    (req, res, next) => {
      res.json(res.locals.product);
      next();
    },
    logHttpReq
  );

  /* CORRISPONDE A QUESTO
  app.get("/products/:id",(req , res) => {
    const id = Number(req.params.id);
    if(isNaN(id)) {
      return res.status(400).json({message: "id is not a number"});
    }
    const product = products.find((item)=> item.id === id );
    if(!product){
      return res.status(404).json({message: "products not found"});
    }
    res.json(products);
  })
*/
  
  app.get(
    "/products",
    (req, res, next) => {
      res.json(products);
      next();
    },
    logHttpReq
  );










  app.all('*',(req,res) => {
  res.send("<h1>Resource not found</h1>")
});
    
   
app.listen(3000, () => {
    console.log("Server is running")
  }); 



