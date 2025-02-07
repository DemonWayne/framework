import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';
import { Listener } from '../../../lib/structures/Listener';
import { Events, type ContextMenuCommandAcceptedPayload } from '../../../lib/types/Events';

export class CoreListener extends Listener<typeof Events.ContextMenuCommandAccepted> {
	public constructor(context: Listener.Context) {
		super(context, { event: Events.ContextMenuCommandAccepted });
	}

	public async run(payload: ContextMenuCommandAcceptedPayload) {
		const { command, context, interaction } = payload;

		const result = await Result.fromAsync(async () => {
			this.container.client.emit(Events.ContextMenuCommandRun, interaction, command, { ...payload });

			const stopwatch = new Stopwatch();
			const result = await command.contextMenuRun(interaction, context);
			const { duration } = stopwatch.stop();

			this.container.client.emit(Events.ContextMenuCommandSuccess, { ...payload, result, duration });

			return duration;
		});

		result.inspectErr((error) => this.container.client.emit(Events.ContextMenuCommandError, error, { ...payload, duration: -1 }));

		this.container.client.emit(Events.ContextMenuCommandFinish, interaction, command, {
			...payload,
			success: result.isOk(),
			duration: result.unwrapOr(-1)
		});
	}
}
