let data_obj = {
    om: "5d793b949d8fac13553d1204",
    _id: {
        $gte: "5d793b949d8fac13553d1204"
    },
    _id: {
        $in: [
            "5d793b949d8fac13553d1204"
        ]
    },
    l: [
        "5d793b949d8fac13553d1204",
        { hello: "5d793b949d8fac13553d1204" }],
    asd: 1
};
function traverseObj(obj, identifier, mutator) {
    if (!Array.isArray(obj) && typeof obj !== 'object') return;


    if (Array.isArray(obj)) {
        obj.forEach((element, index) => {
            if (CanMutate(identifier, mutator)) {
                if (IdentifiedBy(identifier, element)) {
                    obj[index] = mutator(element);
                } else {
                    traverseObj(element, identifier, mutator);
                }
            }
        })
        return obj;
    }

    if (typeof obj === 'object' && !Array.isArray(obj)) {
        for (const field in obj) {
            if (obj.hasOwnProperty(field)) {
                const element = obj[field];

                if (CanMutate(identifier, mutator)) {
                    if (IdentifiedBy(identifier, element,field)) {
                        obj[field] = mutator(element);
                        continue;
                    } else {
                        traverseObj(element, identifier, mutator);
                    }
                }
            }
        }
        return obj;
    }
}
function IdentifiedBy(identifier, element,field) { return identifier(element,field) };
function CanMutate(identifier, mutator) { return typeof identifier === 'function' && typeof mutator === 'function' }

function IdentifyMongoId(element) {
    if (typeof element !== 'string') return false;
    if (!/^([a-f]|\d){24}$/.test(element)) return false;
    return true;
}



// ===============================================
// function IsNumber(element) { return typeof element === 'number'; };

// traverseObj(data_obj, IdentifyMongoId, (element) => { console.log(element); return element + '--' })
// traverseObj(data_obj, IsNumber, (element) => { console.log(element); return element + '--' })

// console.log(data_obj);
export{ traverseObj };