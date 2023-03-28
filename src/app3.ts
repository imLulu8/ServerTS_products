import express, { Request, Response, NextFunction } from "express";
import { param, body, validationResult, query } from 'express-validator';
import axios from 'axios';


const app = express();

app.get("/status", (req, res) => res.json({message : "Server is running"}));

const urlProducts = "https://fakestoreapi.com/products"

type Product = {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: {
      rate: number;
      count: number;
    };
  };

app.use(express.json());

const isAuth = ({ headers }: Request, res: Response, next: NextFunction) => {
    if (headers.authorization === "pippo") {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

const checkError = (req: Request, res: Response, next: NextFunction) => 
!validationResult(req).
isEmpty() ? res.status(400).json({ errors: validationResult(req).array() }) : next();



const logHttpReq = (req: Request, res: Response) => {
    console.log(req.originalUrl);
  };

  //products?limit=10&skip=5

app.get(
    "/products",
    query("limit").optional().isInt().toInt(),
    query("skip").optional().isInt().toInt(),
    query("q").optional().isString(),  //cerca quello che serve tipo i nomi q=Sandisk
    checkError,
  //       ({url, query}, res) => {
  //       const arr = url.split("?");
  //       axios
  //       .get(`${urlProducts}${arr[1] ? "?" + arr[1] : ""}`)
  //       .then(({ data }: { data: Product[] }) => {
  //         if (query.q) {
  //           res.json(
  //             data.filter(
  //               ({ title, description }) =>
  //                 title.includes(query.q as string) ||
  //                 description.includes(query.q as string)
  //             )
  //           );
  //         }
  //         if (query.rate){
  //               const maxRate = Math.max(...data.map((product) => product.rating.rate));
  //               const minRate = Math.min(...data.map((product) => product.rating.rate));
  //               const avgRate = data.map((product) => product.rating.rate).reduce((acc,item) => acc+item / data.length,0);
  //           res.json({data, maxRate, minRate, avgRate});
  //         }
  //         else {
  //           res.json(data);
  //         }
  //       });
  //   }
  // );

  //CON ASYNC
  async({url, query}, res) => {
    const arr = url.split("?");
    const response = await axios
    .get(`${urlProducts}${arr[1] ? "?" + arr[1] : ""}`);
   const {data}: {data: Product[]} = response;
      if (query.q) {
        res.json(
          data.filter(
            ({ title, description }) =>
              title.includes(query.q as string) ||
              description.includes(query.q as string)
          )
        );
      }
      if (query.rate){
            const maxRate = Math.max(...data.map((product) => product.rating.rate));
            const minRate = Math.min(...data.map((product) => product.rating.rate));
            const avgRate = data.map((product) => product.rating.rate).reduce((acc,item) => acc+item / data.length,0);
        res.json({data, maxRate, minRate, avgRate});
      }
      else {
        res.json(data);
      }
    });


app.get(
    "/products/:id",
    isAuth,
    param("id")
    .exists().isInt({max:20}),
    checkError,
    ({params}, res) => {
        axios.get(`https://fakestoreapi.com/products/${params.id}`)
            .then(function(response) {      
                res.json(response.data);
            })
            .catch((err)=> {
                console.log(err);
                res.status(500).json();
            })
    },logHttpReq
);




//aggiungere query params farci tornare max rate min rate





app.listen(3000, () => {
    console.log("Server is running!");
});