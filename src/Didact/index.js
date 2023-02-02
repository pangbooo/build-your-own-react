let nextUnitOfWork = null;

// 1. perform work
// 2. return next unit of work
function performUnitOfWork () {
    // TODO
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

function render(element, container) {
    const dom = element.type === 'TEXT_ELEMENT' 
        ? document.createTextNode(element.props.nodeValue)
        : document.createElement(element.type);

    // add props
    const isProperty = key => key !== 'children';
    Object.keys(element.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = element.props[name]
        })

    element.props.children.forEach(child => render(child, dom))

    container.appendChild(dom);
}

const Didact = {
    createElement,
    render,
}

export default Didact;