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
    const isProperty = key => key !== 'children';
    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = fiber.props[name]
        })

    return dom;
}

// set next unit of work
function render (element, container) {
    nextUnitOfWork = {
        dom: container,
        props: {
            children: [element],
        }
    }
}

let nextUnitOfWork = null;

// 1. perform work
// 2. return next unit of work
function performUnitOfWork (fiber) {
    console.log('fiber......', fiber)
    // 1. TODO add dom node
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }

    // 2. TODO create new fibers
    const elements = fiber.props.children;
    let index = 0;
    let prevSibling = null;

    while (index < elements.length) {
        const element = elements[index];
        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        }

        // add new fiber to the fiber tree 
        // and set it as a child or sibling depending on if it's the first child or not.
        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
    }

    
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

function workLoop (deadline) {
    let shouldYield = false;
    while(nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

const Didact = {
    createElement,
    render,
}

export default Didact;