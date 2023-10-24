import mongoose from "mongoose";

const MetaDataMoldel = new mongoose.Schema({
    period: {
        type: Number,
        required: true
    },
});

export default mongoose.model("MetaDataMoldel", MetaDataMoldel);
