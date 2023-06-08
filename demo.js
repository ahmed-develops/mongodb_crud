const { MongoClient } = require('mongodb')

async function main(){
    const uri = "mongodb+srv://ma675967:NXzSCruuRkzzAAFL@cluster0.vfjgykr.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try {
        await client.connect();
        // await createMultipleListings(client,[ 
        // {
        //     name: "Cottage 1",
        //     summary: "A new cottage",
        //     bedrooms: 1,
        //     bathrooms: 2
        // },
        // {
        //     name: "Cottage 2",
        //     summary: "A new cottage",
        //     bedrooms: 5,
        //     bathrooms: 2

        // },
        // {
        //     name: "Cottage 3",
        //     summary: "A new cottage",
        //     bedrooms: 15,
        //     bathrooms: 23
        // }
        // ]);
    // await findConditionally(client, {
    //     minNoOfBathrooms: 4,
    //     minNoOfBedrooms: 4,
    // });

    // await updateListingByName(client, "Cottage 1", {
    //     name: "Cottage 0"
    // })
    
    await upsertListing(client, "Cottage 4", {
        name : "Cottage 4"
    });

    } catch (e) {
        console.error(e);
    } finally {
        client.close();
    }
}

main().catch(console.error);

async function createListing(client, newListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with id: ${result.insertedId}`);
}

async function createMultipleListings(client, newListings) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);
    console.log(`${result.insertedCount} new listings created with id(s):`);
    console.log(result.insertedIds);
}

async function findOneListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({name : nameOfListing});
    if (result) {
        console.log(`Found a listing for '${nameOfListing}'`);
        console.log(result)
    } else {
        console.log(`Listing not found for '${nameOfListing}'`);
    }
}

async function updateListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
        {name : nameOfListing}, {$set: updatedListing});

    console.log(`${result.matchedCount} document(s) matched the name criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated`);
}

async function upsertListing(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({ name: nameOfListing},{$set : updatedListing}, {upsert: true});

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);

    if (result.upsertedCount > 0) {
        console.log(`One document was inserted with the id ${result.upsertedId._id}`);
    } else {
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
    }
}

async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany(
        { property_type: { $exists: false } }, { $set: { property_type: "Unknown" } }
    );
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function findConditionally(client, { minNoOfBathrooms = 0, minNoOfBedrooms = 0} = {} ) {
    const cursor = await client.db("sample_airbnb").collection("listingsAndReviews").find({
        bedrooms: {$gte : minNoOfBedrooms},
        bathrooms: {$gte: minNoOfBathrooms}
    }).sort({bedrooms: -1})

    const results = await cursor.toArray();

    if (results.length > 0) {
        console.log(`Found listing(s) with at least ${minNoOfBedrooms} bedrooms and ${minNoOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
        });
    } else {
        console.log(`No listings found with at least ${minNoOfBedrooms} bedrooms and ${minNoOfBathrooms} bathrooms`);
    }
}

async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
            .deleteOne({ name: nameOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function deleteListingsScrapedBeforeDate(client, date) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
        .deleteMany({ "last_scraped": { $lt: date } });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};