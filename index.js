const express = require('express')
const cors = require('cors')

const app = express();

const PORT = 10000;

productsDetails = {
    "A" : {"center": "C1", "weight": 3},
    "B" : {"center": "C1", "weight": 2},
    "C" : {"center": "C1", "weight": 8},
    "D" : {"center": "C2", "weight": 12},
    "E" : {"center": "C2", "weight": 25},
    "F" : {"center": "C2", "weight": 15},
    "G" : {"center": "C3", "weight": 0.5},
    "H" : {"center": "C3", "weight": 1},
    "I" : {"center": "C3", "weight": 2}
};

products = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

distance = {
    "C1": {"C2": 4, "L1": 3},
    "C2": {"C1": 4, "L1": 2.5, "C3": 3},
    "C3": {"L1": 2, "C2": 3},
    "L1": {"C1": 3, "C2": 2.5, "C3": 2}
};

app.use(express.json());
app.use(cors());

app.post('/', (req, res) => {
    const order = req.body;
    // console.log(order);

    const locationsToPickup = new Set();
    const weightOfProducts = new Map();
    weightOfProducts.set("L1", 0)

    products.forEach((item) => {
        if (order[item] !== 0) {
            const center = productsDetails[item].center;
            locationsToPickup.add(center);
            if (weightOfProducts.has(center)){
                weightOfProducts.set(center, weightOfProducts.get(center) + productsDetails[item].weight * order[item]);
            }
            else {
                weightOfProducts.set(center, productsDetails[item].weight * order[item]);
            }
        };
    });
    // console.log("Locations To Pickup" ,locationsToPickup)
    // console.log("Weight of Products", weightOfProducts);

    let maxCost = 0;
    let startLocation = "";

    for (const item of locationsToPickup) {
        if (maxCost < distance[item]["L1"]){
            maxCost = Math.max(maxCost, distance[item]["L1"]);
            startLocation = item;
        }
    }
    
    const queue = new Array();
    queue.push(startLocation);

    let totalCost = 0;

    while (queue.length > 0) {
        const currentLocation = queue.shift();
        const nextLocations = Object.keys(distance[currentLocation]);
        let nextLocation = "";
        let nextLocationCost = Infinity;

        nextLocations.forEach((location) => {
            if (locationsToPickup.has(location) && location !== "L1" && nextLocationCost > distance[currentLocation][location]){
                nextLocationCost = distance[currentLocation][location];
                nextLocation = location;
            }
            else if (location === "L1" && nextLocationCost > distance[currentLocation]["L1"]){
                nextLocationCost = distance[currentLocation]["L1"];
                nextLocation = "L1";
            }
        });

        const currentWeight = weightOfProducts.get(currentLocation);
        
        if (currentWeight % 5 === 0 && currentWeight / 5 > 0) {
            totalCost += (10 + 8 * Math.floor(currentWeight / 5) - 1) * nextLocationCost;
        }
        else if (currentWeight % 5 !== 0) {
            totalCost += (10 + 8 * Math.floor(currentWeight / 5)) * nextLocationCost;
        }
        else {
             totalCost += 10 * nextLocationCost;
        }

        locationsToPickup.delete(currentLocation);
        if (locationsToPickup.size === 0)
            break;
        
        queue.push(nextLocation);
    }

    console.log(totalCost);
    
    res.status(200).json({"Minimum Cost" : totalCost})
})



app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});