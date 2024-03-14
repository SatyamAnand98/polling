export class SocketCount {
    private static currentAvailableVoters: number = 0;

    static setVoters() {
        this.currentAvailableVoters++;
    }

    static getVoters() {
        return this.currentAvailableVoters;
    }

    static decreaseVoters() {
        this.currentAvailableVoters--;
    }
}
