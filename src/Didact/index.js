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