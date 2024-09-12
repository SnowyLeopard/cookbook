/*
    The ingredientFractionRegExp is used to identify fractions in the string.
    This is used to exclude strings that contain fractions from being valid.
*/
const fractionRegExp = /^((\d+\s+)?(\d+)\s*\/\s*(\d+)).*/;

function isValidIngredientSyntax(ingredient) {
    /*
        The ingredientSyntaxRegExp checks whether the ingredient string starts with a number,
        possibly followed by a fractional part or a fraction. Then there should be a space
        and then any sequence of characters.
    */
    const ingredientSyntaxRegExp = /^(?:\d+(?:\.\d+)?(?:\/\d+)?)\s?.*$/;

    /*
        The ingredientMultipleSeperatorsRegExp is used to check whether the string contains
        more than one separator (.,) after a number. This is used to exclude strings that
        contain more than one separator from being valid.
    */
    const ingredientMultipleSeparatorsRegExp = /^-?\d+(?:[.,]\d+){2,}.*/;

    /*
        startsWithDoubleHashRegExp checks if the ingredient string begins with "## " followed by any characters.
    */
    const startsWithDoubleHashRegExp = /^## .+$/;

    return (
        startsWithDoubleHashRegExp.test(ingredient) ||
        (ingredientSyntaxRegExp.test(ingredient) &&
            !ingredientMultipleSeparatorsRegExp.test(ingredient))
    );
}

function isIngredientsArrayValid(ingredients) {
    return ingredients.every(isValidIngredientSyntax);
}

function recalculateIngredients(ingredients, currentYield, originalYield) {
    return ingredients.map((ingredient) => {
        if (ingredient.startsWith('## ')) {
            return ingredient;
        }

        if (!Number.isInteger(originalYield) || originalYield < 1) {
            return ingredient;
        }

        const matches = ingredient.match(fractionRegExp);

        if (matches) {
            const [
                ,
                fractionMatch,
                wholeNumberPartRaw,
                numeratorRaw,
                denominatorRaw,
            ] = matches;
            const wholeNumberPart = wholeNumberPartRaw
                ? parseInt(wholeNumberPartRaw, 10)
                : 0;
            const numerator = parseInt(numeratorRaw, 10);
            const denominator = parseInt(denominatorRaw, 10);

            const decimalAmount = wholeNumberPart + numerator / denominator;
            let newAmount = (decimalAmount / originalYield) * currentYield;
            const newWholeNumberPart = parseInt(newAmount, 10);
            let newNumerator = (newAmount - newWholeNumberPart) * 16;
            if (Number.isInteger(newNumerator)) {
                const gcd = (a, b) => b ? gcd(b, a % b) : a;
                let div = gcd(newNumerator, 16);
                newNumerator /= div;
                let newDenominator = 16 / div;
                newAmount = (newWholeNumberPart ? newWholeNumberPart + ' ' : '') + newNumerator + '/' + newDenominator;
            } else {
                newAmount = newAmount.toFixed(2).replace(/[.]00$/, '');
            }

            const newIngredient = ingredient.replace(fractionMatch, newAmount);
            return newIngredient;
        }

        if (isValidIngredientSyntax(ingredient)) {
            const possibleUnit = ingredient
                .split(' ')[0]
                .replace(/[^a-zA-Z]/g, '');
            const amount = parseFloat(
                ingredient.split(' ')[0].replace(',', '.'),
            );
            const unitAndIngredient = ingredient.split(' ').slice(1).join(' ');

            let newAmount = (amount / originalYield) * currentYield;
            newAmount = newAmount.toFixed(2).replace(/[.]00$/, '');

            return `${newAmount}${possibleUnit} ${unitAndIngredient}`;
        }

        return ingredient;
    });
}

export default {
    isValidIngredientSyntax,
    isIngredientsArrayValid,
    recalculateIngredients,
};
