import { getVersion } from '@tauri-apps/api/app';
import { Body, fetch, Response, ResponseType } from '@tauri-apps/api/http';

export class Prepper {
	userAgent: string;
	nations: Nation[];
	jumpPoint: string;
	prep = this.login;

	currentIndex = -1;
	#currentPin = '';
	#currentChk = '';
	#currentLocalId = '';

	constructor(userAgent: string, nations: Nation[], jumpPoint: string) {
		this.userAgent = userAgent;
		this.nations = nations;
		this.jumpPoint = jumpPoint.toLowerCase().replaceAll(' ', '_');
	}

	static async initialize(userAgent: string, nations: Nation[], jumpPoint: string) {
		const version = await getVersion();
		return new Prepper(
			`Vinta ${version}; developed by Esfalsa; used by ${userAgent}`,
			nations,
			jumpPoint
		);
	}

	async login() {
		if (this.currentIndex >= this.nations.length - 1) throw Error('No nations left to prep!');

		this.currentIndex++;

		const { data, headers }: Response<string> = await fetch(
			'https://www.nationstates.net/template-overall=none/page=dossier',
			{
				method: 'POST',
				responseType: ResponseType.Text,
				body: Body.form({
					logging_in: '1',
					nation: this.nations[this.currentIndex].name,
					password: this.nations[this.currentIndex].password,
					submit: 'Login'
				}),
				headers: {
					'User-Agent': this.userAgent
				}
			}
		);

		// console.log(headers);

		this.#currentChk =
			data.match(/<input type="hidden" name="chk" value="(?<chk>.+)">/)?.groups?.chk ?? '';
		this.#currentPin = headers?.['set-cookie'].match(/pin=(?<pin>\d+?)(?=;|$)/)?.groups?.pin ?? '';
		this.#currentLocalId = '';

		console.log(this.#currentChk);

		this.prep = this.apply;
	}

	async apply() {
		await fetch('https://www.nationstates.net/page=UN_status', {
			method: 'POST',
			responseType: ResponseType.Text,
			body: Body.form({
				action: 'join_UN',
				chk: this.#currentChk,
				submit: '1'
			}),
			headers: {
				'User-Agent': this.userAgent,
				Cookie: `pin=${this.#currentPin}`
			}
		});

		this.prep = this.getLocalId;
	}

	async getLocalId() {
		const { data }: Response<string> = await fetch(
			'https://www.nationstates.net/template-overall=none/page=create_region',
			{
				method: 'GET',
				responseType: ResponseType.Text,
				headers: {
					'User-Agent': this.userAgent,
					Cookie: `pin=${this.#currentPin}`
				}
			}
		);

		// console.log(data);

		this.#currentLocalId =
			data.match(/<input type="hidden" name="localid" value="(?<localid>.+)">/)?.groups?.localid ??
			'';

		console.log('localid', this.#currentLocalId);

		this.prep = this.move;
	}

	async move() {
		await fetch('https://www.nationstates.net/template-overall=none/page=change_region', {
			method: 'POST',
			responseType: ResponseType.Text,
			body: Body.form({
				localid: this.#currentLocalId,
				region_name: this.jumpPoint,
				move_region: '1'
			}),
			headers: {
				'User-Agent': this.userAgent,
				Cookie: `pin=${this.#currentPin}`
			}
		});

		this.prep = this.clearDossier;
	}

	async clearDossier() {
		await fetch('https://www.nationstates.net/template-overall=none/page=dossier', {
			method: 'POST',
			responseType: ResponseType.Text,
			body: Body.form({
				chk: this.#currentChk,
				clear_dossier: '1'
			}),
			headers: {
				'User-Agent': this.userAgent,
				Cookie: `pin=${this.#currentPin}`
			}
		});

		this.prep = this.login;
	}
}
