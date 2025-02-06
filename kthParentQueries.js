
/*
    Objective: We are going to be passing in a node structure.
    This node structure will be queried against to get kth index.
    We want to do some heavy lifting initially to create a larger mem index, but will make each query faster.

    Different solutions:
        - We can just create a straight index that maps each id to its' parent.
        - We can create a skip list to make a larger index but increase query times.
*/


class Node {
    constructor(id, children = []) {
        this.id = id;
        this.children = children;
    }
}

/**
* This function will preprocess the node 
* @param {Node} root - Node to create index from
* @param {Number} skipListIncrement - The number to create a skip list from. Defaulted to 10.
* @return Index map, both with express and non express indexes. Express index is at the 1 index. Standard index is at the 0 index.
*/
var indexNodeList = function(root, skipListIncrement = 10){
    let indexHashMap = {};
    let expressHashMap = {};
    //We need to track the skip index when we get the kth parent.
    expressHashMap.skipIndex = skipListIncrement;

    //Recursive function to create the index
    const dfs = function(node, parentId, currentSkipIndex, currentIthParent){
        indexHashMap[node.id] = parentId;
        //If the parent id is not null we want to start skipping 
        if(parentId != null){
            currentSkipIndex--;
        }

        //If we hit the skip index, then let's track the ith parent 
        if(currentSkipIndex === 0){
            expressHashMap[node.id] = currentIthParent;
            currentSkipIndex = skipListIncrement;
            currentIthParent = node.id;
        }

        for(let child of node.children){
            //We want to create an object that has the express lane
            dfs(child, node.id, currentSkipIndex, currentIthParent);
        }
    }

    //Set the root parent to null.
    expressHashMap[root.id] = null;
    dfs(root, null, skipListIncrement, root.id);
    return [indexHashMap,expressHashMap];
}



/**
* Get kth index given an index
* @param {Object} indexList - Index list we want to query
* @param {Number} kthParentToReturn - the parent number we want to return
* @param {Array} indexHashMap - an array of the index object. indexHashMap[0] is the 1-1 map. indexHashMap[1] is the express map with the skipIndex property.
* @return id of give kth parent. Returns null if that index does not exist.
*/
var getKthParent = function(id, kthParentToReturn, indexHashMap){
    if (!indexHashMap[0][id] && indexHashMap[0][id] !== null) return null; // Early exit if id does not exist

    //If the kthIndexToRetrieve is 0 and the id exists in the index, then just return that index.
    if(kthParentToReturn === 0){
        return id;
    }
    //If the index is less than or equal to 0 (and we didn't find the id in the index), then return null.
    else if(kthParentToReturn < 0){
        return null;
    }

    //Let's get the first parent and decrement the kthParentToReturn
    let parentToReturn = indexHashMap[0][id];
    kthParentToReturn--;

    const skipindex = indexHashMap[1].skipIndex;
    while(kthParentToReturn > 0){
        //If we still have to go atleast the skipIndex length
        //AND the parent is indexed in the express index we should use that index.
        if(kthParentToReturn >= skipindex 
            && indexHashMap[1][parentToReturn]){
            parentToReturn = indexHashMap[1][parentToReturn];
            kthParentToReturn-=skipindex;
        }
        //Otherwise we just use the standard index
        else{
            parentToReturn = indexHashMap[0][parentToReturn];
            kthParentToReturn --;
        }

        //If we ever hit a null or empty index, we should just return null.
        if(!parentToReturn){
            return null;
        }
    }

    return parentToReturn;
}



//Test Case1: Parent Node with no children. 
//Testing skip index > nodes provided
//Returning kth parent that is greater than parents available.
let case1Node = { 
    id: 1,
    children: []}
let indexMapCase1 = indexNodeList(case1Node, 10);
console.log(indexMapCase1);
let kthParentToReturnCase1 = getKthParent(96, 90, indexMapCase1);
let kthParentToReturnCase2 = getKthParent(1, 0, indexMapCase1);

console.log("Case 1. Expected value for kthParent is null. Actual value: ", kthParentToReturnCase1);
console.log("Case 2. Expected value for kthParent is 1. The Root. Actual value: ", kthParentToReturnCase2);



//Test Case2: Parent Node with no children. 
//Testing skip index > nodes provided
//Returning kth parent that is greater than parents available.
let case3Node = { 
    id: 1,
    children: [{
        id:2, 
        children: [
            {id:3, children: []}, 
            {id:4, children: []}]}]
}
//console.log(testNode);
let indexMapCase3 = indexNodeList(case3Node, 2);
let kthParentToReturnCase3 = getKthParent(4, 1, indexMapCase3);
let kthParentToReturnCase4 = getKthParent(4, 2, indexMapCase3);
console.log("Case 3. Expected value for kthParent is 2. Actual value: ", kthParentToReturnCase3);
console.log("Case 4. Expected value for kthParent is 1. Actual value: ", kthParentToReturnCase4);

//Test Case4: Deeply nested node structure with 100 ids. 
//Testing a "large" skip index like 10. 
//Returning a "large" kth parent
import {testNode} from './testNode.js'
let indexMapCase5 = indexNodeList(testNode, 10);
let kthParentToReturnCase5 = getKthParent(96, 90, indexMapCase5);
console.log("Case 5 express index: ", indexMapCase5[1]);
console.log("Case 5. Expected value for kthParent is 6. Actual value: ", kthParentToReturnCase5);
