import { AzureFunction, Context } from "@azure/functions";

const queueTrigger: AzureFunction = async function (context: Context, message): Promise<void> {
    context.log('Queue trigger function processed work item', JSON.stringify(message));
    // context.log('expirationTime =', context.bindingData.expirationTime);
    // context.log('insertionTime =', context.bindingData.insertionTime);
    context.log('nextVisibleTime =', context.bindingData.nextVisibleTime);
    // context.log('id =', context.bindingData.id);
    // context.log('popReceipt =', context.bindingData.popReceipt);
    // context.log('dequeueCount =', context.bindingData.dequeueCount);
};

export default queueTrigger;
