import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { SupportSchedule } from '../lib/supabase';
import { Layout } from '../components/Layout';

const DAYS_OF_WEEK = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '7', label: 'Sunday' },
];

const getDayLabels = (dayString: string): string => {
  const dayNumbers = dayString.split(',').map(d => d.trim());
  return dayNumbers
    .map(num => DAYS_OF_WEEK.find(d => d.value === num)?.label || num)
    .join(', ');
};

export function Schedule() {
  const [schedules, setSchedules] = useState<SupportSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<SupportSchedule | null>(null);
  const [formData, setFormData] = useState({
    day_of_week: ['1', '2', '3', '4', '5'] as string[],
    start_time: '09:00',
    end_time: '17:00',
    support_name: '',
    support_jira_id: '',
    support_jira_project_id: '',
    support_jira_project_key: '',
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_schedule')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (schedule?: SupportSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        day_of_week: schedule.day_of_week.split(',').map(d => d.trim()),
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        support_name: schedule.support_name,
        support_jira_id: schedule.support_jira_id,
        support_jira_project_id: schedule.support_jira_project_id,
        support_jira_project_key: schedule.support_jira_project_key,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        day_of_week: ['1', '2', '3', '4', '5'],
        start_time: '09:00',
        end_time: '17:00',
        support_name: '',
        support_jira_id: '',
        support_jira_project_id: '',
        support_jira_project_key: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
    setFormData({
      day_of_week: ['1', '2', '3', '4', '5'],
      start_time: '09:00',
      end_time: '17:00',
      support_name: '',
      support_jira_id: '',
      support_jira_project_id: '',
      support_jira_project_key: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.day_of_week.length === 0) {
      setError('Please select at least one day');
      return;
    }

    const dataToSave = {
      ...formData,
      day_of_week: formData.day_of_week.sort((a, b) => Number(a) - Number(b)).join(','),
    };

    try {
      if (editingSchedule) {
        // Update existing schedule
        const { error } = await supabase
          .from('support_schedule')
          .update(dataToSave)
          .eq('id', editingSchedule.id);

        if (error) throw error;
      } else {
        // Create new schedule
        const { error } = await supabase
          .from('support_schedule')
          .insert([dataToSave]);

        if (error) throw error;
      }

      closeModal();
      fetchSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const { error } = await supabase
        .from('support_schedule')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule');
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Support Schedule</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Manage support schedules for automatic assignee routing.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => openModal()}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:w-auto"
            >
              Add Schedule
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                          Day of Week
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Start Time
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          End Time
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Support Name
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Jira ID
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Project Key
                        </th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      {schedules.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No schedules found. Click "Add Schedule" to create one.
                          </td>
                        </tr>
                      ) : (
                        schedules.map((schedule) => (
                          <tr key={schedule.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                              {getDayLabels(schedule.day_of_week)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                              {schedule.start_time}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                              {schedule.end_time}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                              {schedule.support_name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                              {schedule.support_jira_id}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                              {schedule.support_jira_project_key}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                onClick={() => openModal(schedule)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(schedule.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                  {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Days of Week
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <label key={day.value} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                              checked={formData.day_of_week.includes(day.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, day_of_week: [...formData.day_of_week, day.value] });
                                } else {
                                  setFormData({ ...formData, day_of_week: formData.day_of_week.filter(d => d !== day.value) });
                                }
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{day.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Start Time
                        </label>
                        <input
                          type="time"
                          id="start_time"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2 dark:bg-gray-700 dark:text-white"
                          value={formData.start_time}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          End Time
                        </label>
                        <input
                          type="time"
                          id="end_time"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2 dark:bg-gray-700 dark:text-white"
                          value={formData.end_time}
                          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="support_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Support Name
                      </label>
                      <input
                        type="text"
                        id="support_name"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2 dark:bg-gray-700 dark:text-white"
                        value={formData.support_name}
                        onChange={(e) => setFormData({ ...formData, support_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="support_jira_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Jira ID
                      </label>
                      <input
                        type="text"
                        id="support_jira_id"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2 dark:bg-gray-700 dark:text-white"
                        value={formData.support_jira_id}
                        onChange={(e) => setFormData({ ...formData, support_jira_id: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="support_jira_project_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Jira Project ID
                      </label>
                      <input
                        type="text"
                        id="support_jira_project_id"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2 dark:bg-gray-700 dark:text-white"
                        value={formData.support_jira_project_id}
                        onChange={(e) => setFormData({ ...formData, support_jira_project_id: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="support_jira_project_key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Jira Project Key
                      </label>
                      <input
                        type="text"
                        id="support_jira_project_key"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2 dark:bg-gray-700 dark:text-white"
                        value={formData.support_jira_project_key}
                        onChange={(e) => setFormData({ ...formData, support_jira_project_key: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:col-start-2 sm:text-sm"
                    >
                      {editingSchedule ? 'Save Changes' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:col-start-1 sm:mt-0 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
