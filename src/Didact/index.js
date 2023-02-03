function createTextElement (text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => typeof child === 'object' ? child : createTextElement(child)),
        }
    }
};


function createDom(fiber) {
    const dom = fiber.type === 'TEXT_ELEMENT' 
        ? document.createTextNode(fiber.props.nodeValue)
        : document.createElement(fiber.type);

    // add props
    updateDom(dom, {}, fiber.props)

    return dom;
}

// set next unit of work
function render (element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot, // link to the old fiber, the fiber that we committed to the DOM in the previous commit phase.
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let wipRoot = null; // wipRoot => work in progress root that keep the track of fiber tree root.
let currentRoot = null; // last fiber tree we committed to the DOM” after we finish the commit.
let deletions = null;

function reconcileChildren (wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;

    while (index < elements.length || oldFiber !== null) {
        const element = elements[index];
        let newFiber = null;
        const sameType = oldFiber && element && element.type === oldFiber.type;

        // TODO compare oldFiber to element
        // 1. compare type: If old and new fiber have the same type, just update the props.
        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: 'UPDATE', // use this property during the commit phase.
            }
        }
        // 2. If type is different and there is a new element, need to create new element.
        if (!sameType && element) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: 'PLACEMENT',
            }
        }
        // 3. If the types are different and there is an old fiber, we need to remove the old node.
        if (!sameType && oldFiber) {
            oldFiber.effectTag = 'DELETION'
            deletions.push(oldFiber)
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }

        // add new fiber to the fiber tree 
        // and set it as a child or sibling depending on if it's the first child or not.
        if (index === 0) {
            wipFiber.child = newFiber
        } else if (element){
            prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
    }
}

// 1. perform work
// 2. return next unit of work
function performUnitOfWork (fiber) {
    // 1. TODO add dom node
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    // 2. TODO create new fibers
    const elements = fiber.props.children;
    reconcileChildren(fiber, elements);
    
    // 3. TODO return next unit of work
    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent;
    }
}

const isEvent = key => key.startsWith('on');
const isProperty = key => key !== 'children' && !Event[key];
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);

// We compare the props from the old fiber to the props of the new fiber, 
// remove the props that are gone, 
// and set the props that are new or changed.
function updateDom (dom, prevProps, nextProps) {
     // remove old properties
     Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(name => {
            dom[name] = '';
        })

    // set new or changed properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            dom[name] = nextProps[name];
        })

    // remove or change the old event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)[key])
        .forEach(name => {
            const eventType = name.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[name])
        })

    // add new event listener
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name.toLowerCase().substring(2)
            dom.addEventListener(
                eventType,
                nextProps[name]
            )
        })
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }
    const domParent = fiber.parent.dom;

    if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === 'DELETION') {
        domParent.removeChild(fiber.dom);
    } else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        );
    }

    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

// when all work finished, commit the root.
function commitRoot() {
    deletions.forEach(commitWork);
    // TODO add node to dom.
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function workLoop (deadline) {
    let shouldYield = false;
    while(nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

const Didact = {
    createElement,
    render,
}

export default Didact;