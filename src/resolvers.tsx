import { PubSub } from "graphql-subscriptions";
import { Mutation } from "./api/model/mutation";
import { Query } from "./api/model/query";
import { Subscription } from "./api/model/subscription";
const pubsub = new PubSub();
const resolvers = {
    Query: {
    
    },
    Mutation:{

    },
    Subscription:{

    }
}
new Mutation(resolvers.Mutation , pubsub);
new Query(resolvers.Query);
new Subscription(resolvers.Subscription, pubsub);
export {resolvers, pubsub};