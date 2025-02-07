import type { PieceContext } from '@sapphire/pieces';
import { Identifiers } from '../lib/errors/Identifiers';
import { resolveDate } from '../lib/resolvers/date';
import { Argument } from '../lib/structures/Argument';

export class CoreArgument extends Argument<Date> {
	private readonly messages = {
		[Identifiers.ArgumentDateTooEarly]: ({ minimum }: Argument.Context) => `The given date must be after ${new Date(minimum!).toISOString()}.`,
		[Identifiers.ArgumentDateTooFar]: ({ maximum }: Argument.Context) => `The given date must be before ${new Date(maximum!).toISOString()}.`,
		[Identifiers.ArgumentDateError]: () => 'The argument did not resolve to a date.'
	} as const;

	public constructor(context: PieceContext) {
		super(context, { name: 'date' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<Date> {
		const resolved = resolveDate(parameter, { minimum: context.minimum, maximum: context.maximum });
		return resolved.mapErrInto((identifier) =>
			this.error({
				parameter,
				identifier,
				message: this.messages[identifier](context),
				context
			})
		);
	}
}
