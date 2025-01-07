export const exampleFunctions = [
    {
        name: "hello",
        code: `def hello(first: str, last: str) -> str:
    """ Returns a greeting. 
    Args:
        first: first name of the person
        last: last name of the person
    """
    greeting = f"Hello {first} {last}!"
    return greeting`,
        description: "Returns a greeting",
        signature: "=HELLO(first, last)",
        demo: [["Nancy", "Morgan"], ["Ming", "Lee"]],
        timestamp: new Date().toISOString()
    }
];